import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { needsRoleRefresh } from "@/lib/authSession";

type UserRole = "admin" | "client";

const AUTH_ASYNC_TIMEOUT_MS = 8000;

const withTimeout = <T,>(promise: PromiseLike<T>, timeoutMs: number, label: string): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timerId = setTimeout(() => {
      reject(new Error(`[Auth] ${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    Promise.resolve(promise)
      .then((value) => {
        clearTimeout(timerId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timerId);
        reject(error);
      });
  });
};

const normalizeRole = (value: unknown): UserRole | null => {
  if (value === "admin" || value === "client") return value;
  return null;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  sessionValid: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  // `bootstrapping` is true only during initial session + role resolution.
  // It becomes false once and stays false (repeated auth events don't re-toggle it).
  const [bootstrapping, setBootstrapping] = useState(true);
  const [resolvingRole, setResolvingRole] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  // Keep a ref so callbacks always read the current role without stale closure
  const roleRef = useRef<UserRole | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const roleResolveSeqRef = useRef(0);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  // ── Role resolver ──────────────────────────────────────────────────────────
  const resolveRole = useCallback(async (userId: string, metadataRole?: unknown): Promise<UserRole> => {
    if (!supabase) return "client";
    try {
      const { data, error } = await withTimeout(
        supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single(),
        AUTH_ASYNC_TIMEOUT_MS,
        "profiles role lookup"
      );

      if (!error && data?.role) {
        return normalizeRole(data.role) ?? "client";
      }

      // Fallback to user metadata from current event/session
      const roleFromMetadata = normalizeRole(metadataRole);
      if (roleFromMetadata) return roleFromMetadata;

      // Final fallback to live auth user metadata (if same user)
      const {
        data: { user: authUser },
      } = await withTimeout(
        supabase.auth.getUser(),
        AUTH_ASYNC_TIMEOUT_MS,
        "auth user lookup"
      );

      if (authUser?.id === userId) {
        return normalizeRole(authUser.user_metadata?.role) ?? "client";
      }

      return "client";
    } catch {
      return normalizeRole(metadataRole) ?? "client";
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      console.warn("[Auth] Supabase client unavailable — limited mode");
      setBootstrapping(false);
      return;
    }

    let isMounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session: storedSession },
        } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (storedSession?.user) {
          setSession(storedSession);
          setUser(storedSession.user);
          setSessionValid(true);
          const resolvedRole = await resolveRole(
            storedSession.user.id,
            storedSession.user.user_metadata?.role
          );
          if (!isMounted) return;
          setRole(resolvedRole);
          currentUserIdRef.current = storedSession.user.id;
        } else {
          setSession(null);
          setUser(null);
          setSessionValid(false);
          setRole(null);
          currentUserIdRef.current = null;
        }
      } catch (err) {
        console.error("[Auth] init error:", err);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setSessionValid(false);
          setRole(null);
          currentUserIdRef.current = null;
        }
      } finally {
        setBootstrapping(false);
      }
    };

    initAuth();

    // Supabase fires INITIAL_SESSION on client init - handled by initAuth() to avoid race conditions.
    // TypeScript doesn't know about INITIAL_SESSION but it's a real event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      if ((event as string) === "INITIAL_SESSION") return;

      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        setSessionValid(true);
        const previousUserId = currentUserIdRef.current;

        const nextUserId = newSession.user.id;
        const shouldRefreshRole = needsRoleRefresh(
          event,
          roleRef.current,
          previousUserId,
          nextUserId
        );

        currentUserIdRef.current = nextUserId;

        // Re-resolve role only when needed
        if (shouldRefreshRole) {
          const requestSeq = ++roleResolveSeqRef.current;
          const roleUserId = nextUserId;
          setResolvingRole(true);

          try {
            const resolvedRole = await resolveRole(roleUserId, newSession.user.user_metadata?.role);
            if (!isMounted) return;

            // Ignore stale requests (newer one started) or user switched again
            if (roleResolveSeqRef.current === requestSeq && currentUserIdRef.current === roleUserId) {
              setRole(resolvedRole);
            }
          } finally {
            setResolvingRole(false);
          }
        }
      } else {
        // Session gone
        setSession(null);
        setUser(null);
        setRole(null);
        setSessionValid(false);
        currentUserIdRef.current = null;
        roleResolveSeqRef.current += 1;
        setResolvingRole(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [resolveRole]);

  const signOut = async (): Promise<void> => {
    try {
      if (supabase) await supabase.auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
      setRole(null);
      setSessionValid(false);
      currentUserIdRef.current = null;
      roleResolveSeqRef.current += 1;
      setResolvingRole(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, role, loading: bootstrapping || resolvingRole, signOut, sessionValid }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
