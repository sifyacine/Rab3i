# T03 — Settings (SEO / maintenance / notifications) + User-management fixes — Completion Report

**Status:** ✅ done (branch `dev`) · **Date:** 2026-07-14
**Task spec:** [T03-store-settings.md](T03-store-settings.md)

This session delivered T03 **and** the user-management fixes reported from production.

---

## Part A — User-management fixes

Reported from the live `/admin/users`: only one user showed, dates were in Arabic‑Indic digits, and CRUD needed to be solid.

| Issue | Fix |
|---|---|
| Only the logged-in manager appeared (others hidden) | **RLS** — `profiles` only allowed selecting your own row. Added permissive SELECT policies so managers/admins read **all** profiles (+ everyone reads own). Writes still only via the edge function / `update_own_profile` RPC. → `docs/sql/2026-07-14-fix-user-management-rls.sql` |
| Dates rendered as `٢٠٢٦ ٧ ١٣` (Arabic‑Indic) | Globally switched the Intl locale `"ar-SA"` → `"ar-SA-u-ca-gregory-nu-latn"` across ~21 files — keeps Arabic month names, forces **Latin digits + Gregorian**. |
| CRUD robustness | The Users UI already had full CRUD (view/edit/switch-role/ban/unban/delete with self-guards). Hardened the last direct write: `usersService.updateUser` now goes through the `manage-users` edge function's new **`update`** action (profile fields only — never role), so no broad manager-write RLS policy is needed. |

**CRUD surface (all via the manager-gated edge function, service role):** create (confirmed account, chosen role), update (name/phone/job title), switch role (manager⇄worker, blocks self-demote), ban/unban (blocks login), delete (auth account + profile). Reads (list/details/workers) are RLS-gated to staff.

---

## Part B — T03: Settings SEO / maintenance / notifications

The non-functional SEO/maintenance/notification cards (removed in the earlier mock cleanup) are rebuilt on `store_settings`.

| Area | File | Change |
|---|---|---|
| Schema | `docs/sql/2026-07-14-store-settings-t03.sql` (new) | Adds `seo_description`, `maintenance_mode` (bool), `notify_new_requests` (bool, default true), `notify_weekly_blog` (bool). |
| Settings | `src/pages/admin/Settings.tsx` | New "Site settings" card (SEO textarea + maintenance switch) and "Notifications" card, each with its own save mutation (per-card, no cross-clobber). |
| Enforcement | `src/components/MaintenanceGate.tsx` (new) + `src/App.tsx` | Wraps the **public marketing routes**; when `maintenance_mode` is on, non-staff visitors see a maintenance page. Staff bypass; `/login`, `/forgot-password`, `/reset-password` stay reachable. **Fails open** (renders the site) while auth/query load or on any error, so a hiccup can't take the site down. |

Notifications are **persisted preferences** (the delivery pipeline is future work) — they save real state rather than being fake toggles.

## Verification
- **Type-check + build:** clean. **Tests:** `63 passed`.
- **Adversarial review:** an 8-agent workflow (3 lenses → verification). Confirmed findings, all **fixed**:
  - **MEDIUM** — MaintenanceGate ignored auth loading, so staff could flash the maintenance page on cold load (and be stuck if role resolution stalled). Fixed: it now fails open while `loading`, only blocking a settled non-staff visitor.
  - **LOW** — saving one Settings card re-seeded all local state from the refetch, wiping unsaved edits in the other cards. Fixed: local state is seeded once (a `seeded` ref).
  - Refuted: the edge-function "deploy coupling" (inherent + documented) and a speculative save-while-loading claim (pre-existing, buttons gated by data presence).

## To deploy
1. Run these in the Supabase SQL editor:
   - `docs/sql/2026-07-14-fix-user-management-rls.sql` (managers see all users)
   - `docs/sql/2026-07-14-store-settings-t03.sql` (SEO / maintenance / notifications columns)
2. **Redeploy the edge function** (adds the `update` action): `supabase functions deploy manage-users`
3. Ship the frontend (merge `dev` → `main`).
