import { supabase, createStandaloneAuthClient } from "@/lib/supabase";
import { isExistingUnconfirmedSignup } from "@/lib/authSignupOutcome";
import { buildAuthRedirectUrl } from "@/lib/authRedirect";
import type { AuthUserRole } from "@/lib/authSession";

export interface Profile {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  created_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role: AuthUserRole;
}

export const usersService = {
  async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Profile[];
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Profile;
  },

  // Creates a staff account (manager/worker) from the dashboard.
  // Uses a standalone auth client so the manager's own session survives.
  // SECURITY: the role is deliberately NOT put into user_metadata (the signup
  // API is public, so metadata must never grant roles); it is written to the
  // profiles row from the manager's session, which RLS must authorize —
  // see docs/sql/2026-07-13-roles-manager-worker.sql.
  async createUser(input: CreateUserInput) {
    const authClient = createStandaloneAuthClient();
    if (!authClient || !supabase) throw new Error("SUPABASE_UNAVAILABLE");

    const { data, error } = await authClient.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.full_name,
        },
        emailRedirectTo: buildAuthRedirectUrl("/login"),
      },
    });

    if (error) throw error;
    if (isExistingUnconfirmedSignup(data)) throw new Error("EXISTING_UNCONFIRMED");
    if (!data.user) throw new Error("SIGNUP_FAILED");

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: input.email,
        full_name: input.full_name,
        role: input.role,
      });
    if (profileError) throw profileError;

    return data.user;
  },

  async updateUser(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  // Deletes only the profiles row — that revokes all app/RLS access, but the
  // auth account itself survives (the anon key cannot delete auth users).
  // Orphaned auth accounts are cleaned up DB-side; see section 5 of
  // docs/sql/2026-07-13-roles-manager-worker.sql.
  async deleteUser(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
