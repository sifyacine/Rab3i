# T01 — Invoice line items + VAT — Completion Report

**Status:** ✅ done (branch `dev`, uncommitted) · **Date:** 2026-07-14
**Task spec:** [T01-invoice-line-items.md](T01-invoice-line-items.md)

## What was done

Invoices now store **real line items** instead of a single fabricated row, and the invoice list, the details page, and the PDF/preview all show the **same VAT-inclusive grand total**.

### Total semantics (the design decision)
- Line items store **net** unit prices.
- `subtotal = Σ(quantity × unit_price)` · `vat = subtotal × 15%` · **`invoices.total` = `subtotal + vat`** (VAT-inclusive grand total).
- `computeInvoiceTotals()` in `invoicesService.ts` is the **single source of truth**; the service computes and stores `total` from the items so it can't drift from what the form showed.
- The grand total shown in the list, on the details page, and on the PDF/preview is **always the stored `invoices.total`** — they no longer each recompute it.

### Changes
| Area | File | Change |
|---|---|---|
| Schema | `docs/sql/2026-07-14-invoice-items.sql` (new) | `invoice_items` table (`invoice_id` text FK → `invoices(id)` `on delete cascade`), manager-only RLS, optional legacy backfill. **Run this in the Supabase SQL editor.** |
| Service | `src/services/invoicesService.ts` | `InvoiceItem`/`InvoiceInput` types; `Invoice.total` documented as VAT-inclusive; `computeInvoiceTotals()`; `getInvoiceById` embeds `items`; `create/updateInvoice` persist items + compute total; `replaceItems()`; `invoiceToPreviewData()` returns authoritative `subtotal/vat/total`. |
| Form | `src/pages/admin/InvoiceForm.tsx` | Real item rows (description, quantity, net price) with a live subtotal/VAT/total breakdown; loads real items on edit; one normalised `cleanItems` list drives both the display and the save. |
| Details | `src/pages/admin/InvoiceDetails.tsx` | Renders the real items table + subtotal/VAT/total; grand total = stored `invoices.total`. |
| List | `src/pages/admin/Invoices.tsx` | Download, print, **and the "معاينة وطباعة" action** fetch the full invoice and route through `invoiceToPreviewData`. |
| PDF/preview | `src/components/admin/InvoicePDF.tsx`, `InvoicePreviewDialog.tsx` | Accept and prefer the authoritative `subtotal/vat/total`; preview localises currency (ر.س / SAR). |
| Tests | `src/test/invoicesService.test.ts` (new) | 7 tests for `computeInvoiceTotals` + `invoiceToPreviewData`, incl. the grand-total invariant. |

## Verification

- **Type-check:** `tsc --noEmit` clean (only the two pre-existing, unrelated errors).
- **Build:** `npm run build` ✅.
- **Tests:** `63 passed` (56 prior + 7 new), including assertions that the preview's grand total equals the stored total for both itemised and legacy invoices.
- **Adversarial review:** a 17-agent workflow (4 lenses → per-finding verification) reviewed the diff. It confirmed several defects in the first cut — **all were fixed**:

| Finding (confirmed) | Severity | Fix |
|---|---|---|
| List "معاينة وطباعة" action opened the dialog with the raw list row (no items) → showed a fabricated line | HIGH | Routed through `handlePrint`, which fetches the full invoice. |
| PDF/preview recomputed VAT **unrounded** while the service rounded it → grand total differed by a sub-cent from the list/details total | MEDIUM | Threaded authoritative `subtotal/vat/total` into `InvoicePDF` + `InvoicePreviewDialog`; they now display the stored total verbatim. |
| Legacy invoice (no items): PDF grand total ≠ stored total | MEDIUM | Same fix — the helper pins `total` to the stored value and splits VAT as `total − subtotal`. |
| Blank/zero quantity counted as 0 in the live total but stored as 1 → saved total > shown total | MEDIUM | One normalised `cleanItems` list (quantity clamped to ≥1, price to ≥0) drives both the display and the save. |
| A negative/empty row lowered the shown total but was dropped at save | LOW | Same normalisation clamps negatives to 0. |
| English preview showed Arabic currency "ر.س" | LOW | Preview now localises currency per language. |

## Known limitation (documented)
Re-saving a **legacy** invoice (one created before this feature, with no stored items) can shift its stored `total` by at most **±0.01** on its first edit — the net line is reconstructed as `total ÷ 1.15`, and re-grossing a rounded net isn't perfectly reversible. This affects only pre-existing invoices, only once (afterwards it has real items and is self-consistent), and never the **displayed** grand total (which is pinned to the stored value everywhere). The optional backfill in the SQL file materialises those net lines up front if you prefer.

## To deploy
1. Run `docs/sql/2026-07-14-invoice-items.sql` in the Supabase SQL editor (needs `current_staff_role()` from the roles SQL; it's re-created idempotently).
2. Ship the frontend (merge `dev` → `main`).
