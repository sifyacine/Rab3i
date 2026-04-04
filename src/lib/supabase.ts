import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Check your .env file. The application will run in a limited state.");
}

// Only create the client if we have valid credentials to avoid crashes
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Refresh token before it expires
        flowType: 'pkce',
      }
    })
  : (null as any); // Fallback to null; AuthContext and other components will need to handle this

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
      // Session is invalid or expired
      console.warn("Session validation failed:", error?.message);
      // Clear the invalid session from storage
      await supabase.auth.signOut();
      return false;
    }

    // Session is valid
    console.log("Session validated and refreshed");
    return true;
  } catch (err) {
    console.error("Session validation error:", err);
    return false;
  }
}
