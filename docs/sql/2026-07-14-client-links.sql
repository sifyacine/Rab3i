-- ============================================================================
-- T04 — Link projects & invoices to clients; make client stats real
-- ============================================================================
-- The clients list/details showed a "projects" count and "total spent" that
-- nothing maintained, because projects/invoices had no client relationship.
-- This adds the foreign keys; the app then computes the counts/sums on read
-- (no stored counters to drift). Run in the Supabase SQL editor.
-- ============================================================================

alter table public.projects add column if not exists client_id uuid references public.clients(id) on delete set null;
create index if not exists projects_client_id_idx on public.projects (client_id);

alter table public.invoices add column if not exists client_id uuid references public.clients(id) on delete set null;
create index if not exists invoices_client_id_idx on public.invoices (client_id);

-- The FK on projects.client_id is what lets the app read a live count via
-- PostgREST:  clients?select=*,projects(count)
--
-- The old clients.projects_count / clients.total_spent columns are now computed
-- on read and no longer used. Leave them (harmless) or drop them:
--   alter table public.clients drop column if exists projects_count;
--   alter table public.clients drop column if exists total_spent;

-- Verify:
-- select c.name,
--        (select count(*) from projects p where p.client_id = c.id) as projects,
--        (select coalesce(sum(total),0) from invoices i where i.client_id = c.id and i.status='paid') as paid_total
--   from public.clients c order by c.created_at desc;
