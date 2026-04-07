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
