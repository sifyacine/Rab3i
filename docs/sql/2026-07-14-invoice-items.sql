-- ============================================================================
-- T01 — Invoice line items  (RUN MANUALLY in the Supabase SQL editor)
-- ============================================================================
-- Adds itemised billing so invoices store their real line items instead of a
-- single fabricated row, and so the PDF total matches the stored/displayed one.
--
-- Total semantics (enforced in code, src/services/invoicesService.ts):
--   line items hold NET unit prices;
--   subtotal = Σ(quantity × unit_price); vat = subtotal × 0.15;
--   invoices.total = subtotal + vat   (the VAT-inclusive grand total).
-- The invoice list, the details page, and the PDF all show this same grand total.
--
-- Prerequisite: public.current_staff_role() from
--   docs/sql/2026-07-13-roles-manager-worker.sql (re-created below if missing).
-- Assumes invoices.id is text (the app generates 'INV-...' ids client-side).
-- ============================================================================

-- ── 1. Table ─────────────────────────────────────────────────────────────────
create table if not exists public.invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  text not null references public.invoices(id) on delete cascade,
  description text not null default '',
  quantity    numeric not null default 1,
  unit_price  numeric not null default 0,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists invoice_items_invoice_id_idx on public.invoice_items (invoice_id);

-- ── 2. Role helper (idempotent — safe if it already exists) ───────────────────
create or replace function public.current_staff_role()
returns text
language sql
security definer set search_path = public
stable
as $$
  select role::text from public.profiles where id = auth.uid();
$$;

-- ── 3. RLS — manager-only, mirroring the invoices table ──────────────────────
alter table public.invoice_items enable row level security;

drop policy if exists "Managers manage invoice items" on public.invoice_items;
create policy "Managers manage invoice items" on public.invoice_items
  for all
  using (public.current_staff_role() in ('manager', 'admin'))
  with check (public.current_staff_role() in ('manager', 'admin'));

-- ── 4. (Optional) backfill a single net line for legacy invoices ─────────────
-- Existing invoices predate line items. The app already renders a fallback line
-- (total ÷ 1.15) for invoices with no items, so this backfill is OPTIONAL and
-- only needed if you want editable line rows for old invoices in the DB.
-- Treats the stored legacy total as the VAT-inclusive grand total.
--
-- insert into public.invoice_items (invoice_id, description, quantity, unit_price, sort_order)
-- select i.id, 'خدمات تصميم وتطوير', 1, round(i.total / 1.15, 2), 0
--   from public.invoices i
--  where not exists (select 1 from public.invoice_items x where x.invoice_id = i.id);

-- Verify:
-- select i.id, i.total,
--        (select coalesce(sum(quantity*unit_price),0) from invoice_items x where x.invoice_id = i.id) as items_net
--   from public.invoices i order by i.created_at desc limit 20;
