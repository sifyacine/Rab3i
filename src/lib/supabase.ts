import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Check your .env file. The application will run in a limited state.");
}

// Only create the client if we have valid credentials to avoid crashes
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    })
  : null;

/**
 * Auth client that does not persist its session, used to sign up new staff
 * accounts from the dashboard without replacing the logged-in manager's
 * session. Memoized: repeated instances with the same storageKey trigger
 * GoTrueClient multiple-instance warnings.
 */
let standaloneAuthClient: SupabaseClient | null = null;
export function createStandaloneAuthClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!standaloneAuthClient) {
    standaloneAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: "rab3i-staff-signup",
      },
    });
  }
  return standaloneAuthClient;
}

/**
 * Validates and refreshes the current session.
 * Returns true if session is valid, false if it's invalid/expired.
 */
export async function validateAndRefreshSession(): Promise<boolean> {
  if (!supabase) return false;

  try {
    // Try to refresh the session
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data.session) {
      await supabase.auth.signOut();
      return false;
    }

    return true;
  } catch (err) {
    console.error("Session validation error:", err);
    return false;
  }
}
