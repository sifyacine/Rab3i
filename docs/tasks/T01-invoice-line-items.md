# T01 — Invoice line items + VAT reconciliation

**Status:** 🔧 todo · **Priority:** MEDIUM · **Effort:** L (schema + form + PDF)

## Why
`invoicesService` and the `invoices` table store only a single summed `total`. The invoice form (`InvoiceForm.tsx`) lets the user add named line items, but `handleSave` drops them and stores just the total. The list-page PDF/print (`Invoices.tsx`) and the shared preview then hardcode a **single generic line item** priced at `invoice.total`, and `InvoicePDF.tsx` adds a hardcoded **15% VAT**, so the customer-facing PDF grand total is 15% higher than the stored/displayed amount. Result: what the manager types, what the record stores, and what the PDF shows all disagree.

## Scope
- **DB:** a way to persist line items.
- **Service:** read/write items alongside the invoice.
- **Frontend:** invoice form save/load, and the PDF/preview to use real items.
- **Decision:** is `invoices.total` pre-tax or tax-inclusive? Reconcile the PDF to match.

## Steps
1. **Schema (docs/sql):** add an `invoice_items` table:
   `id uuid pk, invoice_id uuid references invoices(id) on delete cascade, description text, quantity numeric default 1, unit_price numeric, sort_order int`. Add RLS mirroring `invoices` (manager-only). *(Alternative: a `jsonb items` column on `invoices` — simpler, but loses per-item querying.)*
2. **Service (`invoicesService.ts`):** `createInvoice`/`updateInvoice` upsert items in the same call; `getInvoiceById` returns embedded `items`. Recompute `total` server-side or in the service from the items so it can't drift.
3. **Form (`InvoiceForm.tsx`):** persist the real item rows; on edit, load them (stop fabricating one fake line).
4. **PDF/preview (`Invoices.tsx`, `InvoiceDetails.tsx`, `InvoicePreviewDialog.tsx`, `InvoicePDF.tsx`):** feed real items; decide VAT policy and make the on-screen total, the stored `total`, and the PDF grand total agree. If `total` is tax-inclusive, stop adding 15% on top; if pre-tax, show tax as a derived line and store/display consistently.

## Files
`docs/sql/*` (new), `src/services/invoicesService.ts`, `src/pages/admin/InvoiceForm.tsx`, `src/pages/admin/InvoiceDetails.tsx`, `src/pages/admin/Invoices.tsx`, `src/components/admin/InvoicePreviewDialog.tsx`, `src/components/admin/InvoicePDF.tsx`.

## Acceptance criteria
- Adding items in the form and reopening shows the same items.
- The list amount, the details total, and the PDF grand total are identical for the same invoice.
- No hardcoded single line item or hardcoded VAT remains.
