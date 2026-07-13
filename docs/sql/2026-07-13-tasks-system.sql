-- ============================================================================
-- Tasks system + staff profile fields  (RUN MANUALLY in the Supabase SQL editor)
-- ============================================================================
-- Adds the manager→worker task workflow:
--   - managers create tasks and assign them to workers (dashboard → المهام)
--   - workers see and update ONLY their own tasks (dashboard → مهامي)
--   - profiles gain phone / job_title so managers have full worker records
--
-- Companion of docs/sql/2026-07-13-roles-manager-worker.sql — run that first
-- (or at least be aware roles may still be legacy 'admin'; the policies below
-- accept both 'manager' and legacy 'admin' for the manager tier).

-- ── 1. Staff profile fields ──────────────────────────────────────────────────
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists job_title text;

-- ── 2. Tasks table ────────────────────────────────────────────────────────────
-- NOTE: project_id assumes public.projects(id) is uuid — check and adapt if not.
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'done', 'canceled')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  due_date date,
  assigned_to uuid references public.profiles(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  worker_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_assigned_to_idx on public.tasks (assigned_to);
create index if not exists tasks_status_idx on public.tasks (status);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ── 3. Role helper (idempotent copy from the roles migration) ────────────────
create or replace function public.current_staff_role()
returns text
language sql
security definer set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ── 4. RLS ────────────────────────────────────────────────────────────────────
alter table public.tasks enable row level security;

drop policy if exists "Managers manage tasks" on public.tasks;
create policy "Managers manage tasks" on public.tasks
  for all
  using (public.current_staff_role() in ('manager', 'admin'))
  with check (public.current_staff_role() in ('manager', 'admin'));

drop policy if exists "Workers view own tasks" on public.tasks;
create policy "Workers view own tasks" on public.tasks
  for select
  using (assigned_to = auth.uid() and public.current_staff_role() = 'worker');

-- Workers may update their own tasks. RLS cannot restrict WHICH columns are
-- written, so the trigger below (section 4b) forces every column except
-- status/worker_notes/updated_at back to its old value for non-manager callers.
-- The with check also blocks reassigning the task to someone else.
drop policy if exists "Workers update own tasks" on public.tasks;
create policy "Workers update own tasks" on public.tasks
  for update
  using (assigned_to = auth.uid() and public.current_staff_role() = 'worker')
  with check (assigned_to = auth.uid());

-- ── 4b. Column-level guard for worker updates ────────────────────────────────
-- A worker calling PostgREST directly could try to change title/priority/etc.
-- Managers (and the legacy 'admin' role) bypass this and may edit any column.
create or replace function public.tasks_restrict_worker_columns()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if public.current_staff_role() in ('manager', 'admin') then
    return new;
  end if;
  -- Non-managers may only move status / worker_notes forward
  new.title        := old.title;
  new.description  := old.description;
  new.priority     := old.priority;
  new.due_date     := old.due_date;
  new.assigned_to  := old.assigned_to;
  new.project_id   := old.project_id;
  new.created_by   := old.created_by;
  new.created_at   := old.created_at;
  -- Workers cannot cancel a task; only pending/in_progress/done are theirs
  if new.status = 'canceled' and old.status <> 'canceled' then
    new.status := old.status;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_worker_column_guard on public.tasks;
create trigger tasks_worker_column_guard
  before update on public.tasks
  for each row execute function public.tasks_restrict_worker_columns();

-- ── 5. Self-service profile edits (safe: cannot touch role) ─────────────────
-- Workers/managers edit their own name & phone via this RPC instead of a
-- direct UPDATE policy on profiles, which could not prevent role changes.
create or replace function public.update_own_profile(new_full_name text, new_phone text)
returns void
language sql
security definer set search_path = public
as $$
  -- Sets both columns directly (the app always sends both current values),
  -- so an empty string clears the field. auth.uid() is null for anonymous
  -- callers, so the WHERE matches nothing — a signed-out call is a no-op.
  update public.profiles
     set full_name = new_full_name,
         phone     = new_phone
   where id = auth.uid();
$$;

-- Lock the security-definer functions down to signed-in users only
-- (they default to EXECUTE for PUBLIC otherwise).
revoke execute on function public.update_own_profile(text, text) from public, anon;
grant execute on function public.update_own_profile(text, text) to authenticated;
revoke execute on function public.current_staff_role() from public, anon;
grant execute on function public.current_staff_role() to authenticated;

-- Staff need to read profiles for the assignee dropdown / Users pages; make
-- sure a select policy like this exists (also in the roles migration guide):
-- create policy "Staff can view profiles" on public.profiles
--   for select using (
--     id = auth.uid() or public.current_staff_role() in ('manager', 'worker', 'admin')
--   );
