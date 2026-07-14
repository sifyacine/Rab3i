import { supabase } from "@/lib/supabase";

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  projects_count: number;
  total_spent: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const clientsService = {
  async getClients() {
    // projects_count comes from a live related-row count; total_spent is summed
    // from the client's PAID invoices — both computed on read (no stored counters).
    const { data, error } = await supabase
      .from('clients')
      .select('*, projects(count)')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const { data: invoices } = await supabase
      .from('invoices')
      .select('client_id, total, status');
    const spent: Record<string, number> = {};
    for (const inv of invoices ?? []) {
      if (inv.client_id && inv.status === 'paid') {
        spent[inv.client_id] = (spent[inv.client_id] ?? 0) + Number(inv.total ?? 0);
      }
    }

    return (data ?? []).map((c: Record<string, unknown> & { id: string; projects?: { count: number }[] }) => ({
      ...c,
      projects_count: Array.isArray(c.projects) ? (c.projects[0]?.count ?? 0) : 0,
      total_spent: spent[c.id] ?? 0,
    })) as unknown as Client[];
  },

  async getClientById(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Client;
  },

  async createClient(client: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();
    if (error) throw error;
    return data as Client;
  },

  async updateClient(id: string, updates: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Client;
  },

  async deleteClient(id: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};