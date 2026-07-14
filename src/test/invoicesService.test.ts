import { describe, it, expect, vi } from "vitest";

// invoicesService imports the Supabase client; stub it (these tests only cover
// the pure money-math helpers, which never touch the network).
vi.mock("@/lib/supabase", () => ({ supabase: {} }));

import { computeInvoiceTotals, invoiceToPreviewData, VAT_RATE, Invoice } from "@/services/invoicesService";

describe("computeInvoiceTotals", () => {
  it("sums net items and adds 15% VAT to reach the grand total", () => {
    const { subtotal, vat, total } = computeInvoiceTotals([
      { quantity: 2, unit_price: 100 },
      { quantity: 1, unit_price: 300 },
    ]);
    expect(subtotal).toBe(500);
    expect(vat).toBe(75);
    expect(total).toBe(575);
    expect(total).toBe(subtotal + vat);
  });

  it("uses the exported VAT_RATE and rounds to 2 decimals", () => {
    const { subtotal, vat, total } = computeInvoiceTotals([{ quantity: 1, unit_price: 33.33 }]);
    expect(VAT_RATE).toBe(0.15);
    expect(subtotal).toBe(33.33);
    expect(vat).toBe(5); // 33.33 * 0.15 = 4.9995 → 5.00
    expect(total).toBe(38.33);
  });

  it("treats string inputs (from form fields) as numbers", () => {
    const { total } = computeInvoiceTotals([
      { quantity: "3" as unknown as number, unit_price: "100" as unknown as number },
    ]);
    expect(total).toBe(345); // 300 net + 45 VAT
  });

  it("returns zeros for no items", () => {
    expect(computeInvoiceTotals([])).toEqual({ subtotal: 0, vat: 0, total: 0 });
  });
});

describe("invoiceToPreviewData", () => {
  const base: Invoice = {
    id: "INV-1",
    created_at: "2026-07-14",
    total: 575,
    payment_method: null,
    customer_name: "Acme",
    customer_phone: null,
    status: "unpaid",
  };

  it("maps stored net items to preview items and exposes authoritative totals == stored total", () => {
    const data = invoiceToPreviewData({
      ...base,
      items: [
        { description: "A", quantity: 2, unit_price: 100, sort_order: 0 },
        { description: "B", quantity: 1, unit_price: 300, sort_order: 1 },
      ],
    });
    expect(data.amount).toBe(575);
    expect(data.items).toHaveLength(2);
    // Authoritative totals are threaded to the PDF/preview so the grand total
    // shown there equals the stored invoice.total exactly (no re-compute drift).
    expect(data.total).toBe(575);
    expect(data.subtotal).toBe(500);
    expect(data.vat).toBe(75);
    expect(data.subtotal! + data.vat!).toBe(data.total);
  });

  it("legacy invoice (no items): authoritative total equals the stored total exactly, and subtotal+vat=total", () => {
    // 100 is not 1.15-clean; the naive re-gross would drift, so the helper must
    // pin total to the stored value and split VAT as (total - subtotal).
    const data = invoiceToPreviewData({ ...base, total: 100 });
    expect(data.items).toHaveLength(1);
    expect(data.total).toBe(100);
    expect(data.subtotal! + data.vat!).toBe(100);
  });

  it("sorts items by sort_order", () => {
    const data = invoiceToPreviewData({
      ...base,
      items: [
        { description: "second", quantity: 1, unit_price: 1, sort_order: 1 },
        { description: "first", quantity: 1, unit_price: 1, sort_order: 0 },
      ],
    });
    expect(data.items.map((i) => i.description)).toEqual(["first", "second"]);
  });
});
