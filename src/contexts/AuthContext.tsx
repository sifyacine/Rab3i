import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type UserRole = "admin" | "client";

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
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isInitializing = true;

    const initAuth = async () => {
      try {
        // Get initial session without validation - let onAuthStateChange handle validation
        const { data: { session: storedSession } } = await supabase.auth.getSession();

        if (storedSession && storedSession.user) {
          // Set session state first
          setSession(storedSession);
          setUser(storedSession.user);
          setSessionValid(true);
          
          // Keep loading TRUE until role is fetched - critical for ProtectedRoute
          // This prevents the "limbo state" where user exists but role is null
          await fetchUserRole(storedSession.user.id);
          // fetchUserRole will set loading to false when complete
        } else {
          // No stored session
          setSessionValid(false);
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth init error:", error);
        setSessionValid(false);
        setLoading(false);
      } finally {
        isInitializing = false;
      }
    };

    initAuth();

    // Listen for auth changes - this will validate and refresh tokens automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth event:", event, newSession ? "with session" : "no session");

      // Skip the INITIAL_SESSION event during initialization to avoid race conditions
      if (isInitializing && event === 'INITIAL_SESSION') {
        return;
      }

      if (newSession && newSession.user) {
        // Update auth state with the new session
        setSession(newSession);
        setUser(newSession.user);
        setSessionValid(true);
        
        // Keep loading true while fetching role
        setLoading(true);
        await fetchUserRole(newSession.user.id);
        // fetchUserRole will set loading to false when complete
      } else {
        // No session: fully reset auth state
        setSession(null);
        setUser(null);
        setRole(null);
        setSessionValid(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    if (!supabase) return;
    try {
      // First try to get from profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Could not fetch profile, checking user metadata:", error);
        // Fallback: Check metadata directly from session
        const { data: { session } } = await supabase.auth.getSession();
        const metadataRole = session?.user?.user_metadata?.role as UserRole;

        if (metadataRole) {
          console.log("Found role in metadata:", metadataRole);
          setRole(metadataRole);
        } else {
          // Final fallback
          setRole("client");
        }
      } else {
        setRole(data?.role as UserRole || "client");
      }
    } catch (err) {
      console.error("Unexpected error fetching role:", err);
      setRole("client");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (supabase) {
        // Sign out from Supabase and clear persisted session
        await supabase.auth.signOut();
      }
    } finally {
      // Ensure local auth state is fully cleared immediately
      setSession(null);
      setUser(null);
      setRole(null);
      setSessionValid(false);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut, sessionValid }}>
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
