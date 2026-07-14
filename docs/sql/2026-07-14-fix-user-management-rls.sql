-- ============================================================================
-- FIX: managers can only see themselves in the Users list
-- ============================================================================
-- Symptom: /admin/users shows only the logged-in manager, even though other
-- staff accounts exist.
--
-- Cause: profiles' row-level security only lets a user SELECT their OWN row, so
-- usersService.getUsers() (a plain select on profiles) returns one row for the
-- manager. Managers need to read ALL profiles (Users list, user details, and
-- the task-assignee dropdown).
--
-- Fix: add a permissive SELECT policy for managers. Postgres ONs permissive
-- policies together, so this only GRANTS visibility — it can't restrict the
-- existing own-row access. All WRITES to profiles still go exclusively through
-- the manage-users edge function (service role) or the update_own_profile RPC,
-- so no INSERT/UPDATE policy is added here.
--
-- Prerequisite: public.current_staff_role() (re-created idempotently below).
-- Run in the Supabase SQL editor.
-- ============================================================================

alter table public.profiles enable row level security;

-- Role helper (idempotent — safe if it already exists)
create or replace function public.current_staff_role()
returns text
language sql
security definer set search_path = public
stable
as $$
  select role::text from public.profiles where id = auth.uid();
$$;

-- Everyone can read their own profile (ensures self-access exists).
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (id = auth.uid());

-- Managers (and legacy admins) can read every profile.
drop policy if exists "Managers can view all profiles" on public.profiles;
create policy "Managers can view all profiles" on public.profiles
  for select using (public.current_staff_role() in ('manager', 'admin'));

-- Verify (as a manager, this should now return every staff row):
-- select id, email, role from public.profiles order by created_at desc;
