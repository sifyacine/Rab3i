import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { needsRoleRefresh } from "@/lib/authSession";

type UserRole = "admin" | "client";

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
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (!error && data?.role) {
        return normalizeRole(data.role) ?? "client";
      }

      // Fallback to user metadata from current event/session
      const roleFromMetadata = normalizeRole(metadataRole);
      if (roleFromMetadata) return roleFromMetadata;

      // Final fallback to live auth user metadata (if same user)
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

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
        const { data: { session: storedSession } } = await supabase.auth.getSession();
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
        if (isMounted) setBootstrapping(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      if (event === "INITIAL_SESSION") return; // handled by initAuth

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
            if (isMounted && roleResolveSeqRef.current === requestSeq) {
              setResolvingRole(false);
            }
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
