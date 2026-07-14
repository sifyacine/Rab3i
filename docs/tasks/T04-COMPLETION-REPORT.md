# T04 — Client ↔ project/invoice linking + password-field fix — Completion Report

**Status:** ✅ done (branch `dev`) · **Date:** 2026-07-14
**Task spec:** [T04-client-project-linking.md](T04-client-project-linking.md)

## Part A — Password field visibility (dark & light)
The login/reset password dots weren't visible in dark mode (browser autofill forced its own colors). Fix in `src/index.css`: an `input:-webkit-autofill` rule with `-webkit-text-fill-color`/`box-shadow` bound to the `--foreground`/`--secondary` theme tokens (so it flips with the theme), plus `input[type="password"] { -webkit-text-fill-color: currentColor }` so typed dots always follow the input's text color. Works in both themes.

## Part B — T04: client links & real stats
`clients.projects_count` / `total_spent` were unmaintained because projects/invoices had no client relationship.

| Area | File | Change |
|---|---|---|
| Schema | `docs/sql/2026-07-14-client-links.sql` (new) | `projects.client_id` + `invoices.client_id` (uuid FK → `clients(id)` `on delete set null`) + indexes. |
| Types/Service | `src/types/portfolio.ts`, `projectsService.ts` | `Project.client_id`; `createProject` writes it; new `getProjectsByClient(clientId)`. |
| Service | `clientsService.ts` | `getClients()` computes **projects_count** from a live related-row count (`projects(count)` embed) and **total_spent** from the client's **paid** invoices — both on read (no stored counters to drift). |
| Service | `invoicesService.ts` | `Invoice.client_id`; create/update write it; new `getInvoicesByClient(clientId)`. |
| Forms | `ProjectForm.tsx`, `InvoiceForm.tsx` | Optional client selector — a project can be linked to a client (step 3); an invoice can be linked (prefills name/phone). |
| Details | `ClientDetails.tsx` | Real projects **list** + count and total_spent (from paid invoices) instead of the stored columns. |
| List | `Clients.tsx` | The "projects" column now shows the true, computed count. |

**Result:** assigning a project to a client updates that client's project count everywhere; the clients list/details show true counts; no column is presented as a live stat while nothing maintains it (criteria met).

## Verification
- **Type-check + build + tests:** clean, `63 passed`. (Also fixed a pre-existing `cat.name` type error surfaced by the edits.)
- **Adversarial review:** a 7-agent workflow (2 lenses → verification) → **0 confirmed defects** (all findings refuted: RLS-embed safety, prefill-by-design, category-slug fallback).
- **Privacy follow-up:** the review noted I'd added a `client:clients(id,name)` embed to the *shared* projects query, which the **public** portfolio also uses — it was unused in the UI and could put client names in the public API payload, so I **removed it** (client is read per-client via `getProjectsByClient`, admin-side only).

## Known limitation
`getClients()` fetches all invoices (id/total/status) to sum `total_spent` in JS — fine for a small CRM; revisit with a DB aggregate/view if the invoice table grows large.

## To deploy
1. Run `docs/sql/2026-07-14-client-links.sql` in the Supabase SQL editor.
2. Ship the frontend (merge `dev` → `main`).
