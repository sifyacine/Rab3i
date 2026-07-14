import { supabase } from "@/lib/supabase";

const generateId = () => {
  return 'INV-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9).toUpperCase();
};

export const VAT_RATE = 0.15;
const round2 = (n: number) => Math.round(n * 100) / 100;

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;   // NET (pre-VAT) unit price
  sort_order?: number;
}

export interface Invoice {
  id: string;
  created_at: string;
  total: number;        // grand total, VAT-inclusive (15%) — see computeInvoiceTotals
  payment_method: string | null;
  customer_name: string;
  customer_phone: string | null;
  status: "paid" | "unpaid" | "overdue" | "canceled";
  items?: InvoiceItem[];
}

export interface InvoiceInput {
  customer_name: string;
  status: Invoice["status"];
  customer_phone?: string | null;
  payment_method?: string | null;
  items: InvoiceItem[];
}

/**
 * Single source of truth for invoice money math.
 * Items hold NET unit prices; the returned `total` is VAT-inclusive and is what
 * gets stored in invoices.total and shown everywhere (list, details, PDF grand).
 */
export function computeInvoiceTotals(items: Pick<InvoiceItem, "quantity" | "unit_price">[]) {
  const subtotal = round2(
    items.reduce((acc, i) => acc + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0)
  );
  const vat = round2(subtotal * VAT_RATE);
  const total = round2(subtotal + vat);
  return { subtotal, vat, total };
}

/**
 * Maps a stored invoice to the shape the shared preview/PDF components expect
 * (their `price` is a net unit price; they re-add 15% VAT to reach the grand
 * total, which equals the stored `total`). Invoices with no persisted items
 * (legacy) fall back to a single net line = total ÷ 1.15 so the PDF grand still
 * equals the stored total.
 */
export function invoiceToPreviewData(invoice: Invoice) {
  const hasItems = Boolean(invoice.items && invoice.items.length);
  const sorted = hasItems
    ? invoice.items!.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    : [];

  const items = hasItems
    ? sorted.map((it) => ({ description: it.description, quantity: Number(it.quantity) || 1, price: Number(it.unit_price) || 0 }))
    : [{ description: "خدمات تصميم وتطوير", quantity: 1, price: round2(invoice.total / (1 + VAT_RATE)) }];

  // Authoritative totals: the grand total ALWAYS equals the stored invoice.total,
  // so the list, the details page, and the PDF/preview show the same number
  // regardless of rounding. The preview/PDF components use these instead of
  // recomputing from items.
  const totals = hasItems
    ? computeInvoiceTotals(invoice.items!)
    : (() => {
        const subtotal = round2(invoice.total / (1 + VAT_RATE));
        return { subtotal, vat: round2(invoice.total - subtotal), total: invoice.total };
      })();

  return {
    id: invoice.id,
    clientName: invoice.customer_name,
    clientEmail: "",
    amount: invoice.total,
    currency: "SAR",
    status: invoice.status,
    date: invoice.created_at,
    dueDate: invoice.created_at,
    items,
    subtotal: totals.subtotal,
    vat: totals.vat,
    total: totals.total,
  };
}

// Delete-then-insert the item rows for an invoice. Item counts are tiny and this
// runs only when a manager saves one invoice, so the lack of a transaction is
// acceptable (documented trade-off).
async function replaceItems(invoiceId: string, items: InvoiceItem[]) {
  const { error: delError } = await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
  if (delError) throw delError;

  const rows = items
    .filter((it) => (it.description && it.description.trim()) || Number(it.unit_price) > 0)
    .map((it, idx) => ({
      invoice_id: invoiceId,
      description: (it.description || "").trim(),
      quantity: Number(it.quantity) || 1,
      unit_price: Number(it.unit_price) || 0,
      sort_order: idx,
    }));

  if (rows.length) {
    const { error } = await supabase.from("invoice_items").insert(rows);
    if (error) throw error;
  }
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
      .select('*, items:invoice_items(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    const invoice = data as Invoice;
    invoice.items = (invoice.items ?? []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    return invoice;
  },

  async createInvoice(input: InvoiceInput) {
    const id = generateId();
    const { total } = computeInvoiceTotals(input.items);
    const { data, error } = await supabase
      .from('invoices')
      .insert([{
        id,
        customer_name: input.customer_name,
        status: input.status,
        customer_phone: input.customer_phone ?? null,
        payment_method: input.payment_method ?? null,
        total,
      }])
      .select()
      .single();
    if (error) throw error;
    await replaceItems(id, input.items);
    return { ...(data as Invoice), items: input.items };
  },

  async updateInvoice(id: string, input: InvoiceInput) {
    const { total } = computeInvoiceTotals(input.items);
    const { data, error } = await supabase
      .from('invoices')
      .update({
        customer_name: input.customer_name,
        status: input.status,
        customer_phone: input.customer_phone ?? null,
        payment_method: input.payment_method ?? null,
        total,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await replaceItems(id, input.items);
    return { ...(data as Invoice), items: input.items };
  },

  async deleteInvoice(id: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
