import { supabase } from "@/lib/supabase";

const generateId = () => {
  return 'INV-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9).toUpperCase();
};

export interface Invoice {
  id: string;
  created_at: string;
  total: number;
  payment_method: string | null;
  customer_name: string;
  customer_phone: string | null;
  status: "paid" | "unpaid" | "overdue" | "canceled";
}

export const invoicesService = {
  async getInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Invoice[];
  },

  async getInvoiceById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Invoice;
  },

  async createInvoice(invoice: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .insert([{ ...invoice, id: generateId() }])
      .select()
      .single();
    if (error) throw error;
    return data as Invoice;
  },

  async updateInvoice(id: string, updates: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Invoice;
  },

  async deleteInvoice(id: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};