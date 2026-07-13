import { supabase } from "@/lib/supabase";
import type { AuthUserRole } from "@/lib/authSession";

export interface Profile {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  phone: string | null;
  job_title: string | null;
  is_banned: boolean;
  created_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role: AuthUserRole;
  phone?: string;
  job_title?: string;
}

// Calls the privileged `manage-users` edge function (service role). The manager
// check is enforced server-side; the client just forwards the manager's JWT
// (supabase-js attaches it to functions.invoke automatically).
async function invokeManageUsers(body: Record<string, unknown>) {
  if (!supabase) throw new Error("SUPABASE_UNAVAILABLE");
  const { data, error } = await supabase.functions.invoke("manage-users", { body });
  if (error) {
    // Edge-function non-2xx responses surface as FunctionsHttpError; the useful
    // message is in the response body, not error.message.
    let message = error.message;
    try {
      const ctx = (error as { context?: Response }).context;
      const payload = ctx && typeof ctx.json === "function" ? await ctx.json() : null;
      if (payload?.error) message = payload.error;
    } catch {
      /* fall back to error.message */
    }
    throw new Error(message);
  }
  return data as { ok?: boolean; id?: string };
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

  // Workers list for the task-assignee dropdown
  async getWorkers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'worker')
      .order('full_name', { ascending: true });
    if (error) throw error;
    return data as Profile[];
  },

  // Self-service: edit own name/phone via the security-definer RPC
  // (a direct profiles UPDATE policy could not prevent role changes).
  // The RPC sets both columns directly, so an empty string clears the field.
  async updateOwnProfile(input: { full_name: string; phone: string }) {
    const { error } = await supabase.rpc('update_own_profile', {
      new_full_name: input.full_name,
      new_phone: input.phone,
    });
    if (error) throw error;
  },

  // ── Privileged actions (managers only, via the edge function) ─────────────

  // Creates a confirmed staff account with the chosen role in one round-trip.
  async createUser(input: CreateUserInput) {
    return invokeManageUsers({ action: "create", ...input });
  },

  // Switches a user's role (manager ⇄ worker)
  async setUserRole(id: string, role: AuthUserRole) {
    return invokeManageUsers({ action: "set_role", userId: id, role });
  },

  // Fully deletes the auth account AND the profiles row
  async deleteUser(id: string) {
    return invokeManageUsers({ action: "delete", userId: id });
  },

  // Blocks the user from logging in (indefinite) / lifts the block
  async banUser(id: string) {
    return invokeManageUsers({ action: "ban", userId: id });
  },
  async unbanUser(id: string) {
    return invokeManageUsers({ action: "unban", userId: id });
  },

  // Non-privileged profile field edits (name/phone/job_title). Role changes go
  // through setUserRole; RLS must allow managers to update these columns.
  async updateUser(id: string, updates: Partial<Pick<Profile, "full_name" | "phone" | "job_title">>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },
};
