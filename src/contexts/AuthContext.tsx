import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { needsRoleRefresh, normalizeStaffRole, type AuthUserRole } from "@/lib/authSession";

type UserRole = AuthUserRole;

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

const normalizeRole = normalizeStaffRole;

// Cache the resolved role so a page refresh renders instantly instead of waiting
// on (or being logged out by) a slow/failed DB role lookup. The client-side role
// is only UI gating — RLS and the manage-users edge function are the real
// security boundary — so caching it is safe.
const ROLE_CACHE_KEY = "rab3i-role";
const readCachedRole = (userId: string): UserRole | null => {
  try {
    const raw = localStorage.getItem(ROLE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { userId?: string; role?: string };
    return parsed.userId === userId ? normalizeRole(parsed.role) : null;
  } catch {
    return null;
  }
};
const writeCachedRole = (userId: string, role: UserRole | null) => {
  try {
    if (role) localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify({ userId, role }));
    else localStorage.removeItem(ROLE_CACHE_KEY);
  } catch {
    /* ignore storage errors */
  }
};
const clearCachedRole = () => {
  try {
    localStorage.removeItem(ROLE_CACHE_KEY);
  } catch {
    /* ignore */
  }
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
  // Resolves to null when the account has no staff role (e.g. legacy client
  // accounts or lookup failures) — the app fails closed and denies access.
  // Returns { role, definitive }. `definitive` is true only when the DB gave an
  // authoritative answer (profile read succeeded, or the row is confirmed gone).
  // A transient failure (network/timeout) is NON-definitive, so callers can keep
  // a cached role instead of logging the user out on a hiccup.
  const resolveRole = useCallback(async (userId: string, metadataRole?: unknown): Promise<{ role: UserRole | null; definitive: boolean }> => {
    if (!supabase) return { role: null, definitive: false };
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

      // Query succeeded: the profiles row is authoritative. A non-staff value
      // normalizes to null = a DEFINITIVE denial (revoke), not a transient error.
      if (!error) {
        return { role: normalizeRole(data?.role), definitive: true };
      }
      // "No rows" (deleted profile / hidden by RLS) is also a definitive denial.
      if ((error as { code?: string }).code === "PGRST116") {
        return { role: null, definitive: true };
      }

      // Other (transient) DB error → non-definitive; fall back without revoking.
      const roleFromMetadata = normalizeRole(metadataRole);
      if (roleFromMetadata) return { role: roleFromMetadata, definitive: false };

      try {
        const {
          data: { user: authUser },
        } = await withTimeout(supabase.auth.getUser(), AUTH_ASYNC_TIMEOUT_MS, "auth user lookup");
        if (authUser?.id === userId) {
          return { role: normalizeRole(authUser.user_metadata?.role), definitive: false };
        }
      } catch {
        /* ignore — treated as transient below */
      }
      return { role: null, definitive: false };
    } catch {
      // Timeout / network throw → transient; keep any metadata role, don't revoke.
      return { role: normalizeRole(metadataRole), definitive: false };
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
        } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_ASYNC_TIMEOUT_MS,
          "session lookup"
        );
        if (!isMounted) return;

        if (storedSession?.user) {
          const uid = storedSession.user.id;
          setSession(storedSession);
          setUser(storedSession.user);
          setSessionValid(true);
          currentUserIdRef.current = uid;

          const cached = readCachedRole(uid);
          if (cached) {
            // Render immediately with the cached role (fast refresh, stays
            // logged in), then revalidate against the DB in the background.
            setRole(cached);
            resolveRole(uid, storedSession.user.user_metadata?.role)
              .then((res) => {
                // Identity guard: ignore if the user switched while in flight.
                if (!isMounted || currentUserIdRef.current !== uid) return;
                // Apply a DEFINITIVE result (revoke on definitive null) or any
                // resolved role; a transient failure keeps the cached role.
                if (res.definitive || res.role) {
                  writeCachedRole(uid, res.role);
                  if (res.role !== roleRef.current) setRole(res.role);
                }
              })
              .catch(() => { /* keep the cached role */ });
          } else {
            const res = await resolveRole(
              uid,
              storedSession.user.user_metadata?.role
            );
            if (!isMounted) return;
            setRole(res.role);
            writeCachedRole(uid, res.role);
          }
        } else if (currentUserIdRef.current === null) {
          // Guard: a SIGNED_IN event may have arrived while getSession was
          // pending — never wipe a session the listener already established
          setSession(null);
          setUser(null);
          setSessionValid(false);
          setRole(null);
          clearCachedRole();
        }
      } catch (err) {
        console.error("[Auth] init error:", err);
        if (isMounted && currentUserIdRef.current === null) {
          setSession(null);
          setUser(null);
          setSessionValid(false);
          setRole(null);
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
          // Never show the previous user's role while the new one resolves
          if (previousUserId !== roleUserId) {
            setRole(null);
          }
          setResolvingRole(true);

          try {
            const res = await resolveRole(roleUserId, newSession.user.user_metadata?.role);
            if (!isMounted) return;

            // Ignore stale requests (newer one started) or user switched again
            if (roleResolveSeqRef.current === requestSeq && currentUserIdRef.current === roleUserId) {
              // Apply a definitive result (revoke on definitive null) or any
              // resolved role; a transient null keeps the current/cached role.
              if (res.definitive || res.role) {
                setRole(res.role);
                writeCachedRole(roleUserId, res.role);
              }
            }
          } finally {
            // A superseded request must not clear the flag for the newer one
            if (roleResolveSeqRef.current === requestSeq) {
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
        clearCachedRole();
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
      clearCachedRole();
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
