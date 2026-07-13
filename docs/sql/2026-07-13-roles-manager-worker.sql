-- ============================================================================
-- Roles migration: admin/client → manager/worker  (RUN MANUALLY, STEP BY STEP)
-- ============================================================================
-- ⚠️ This file intentionally lives in docs/sql/ and NOT in supabase/migrations/
-- so `supabase db push` can never apply it blindly. Run it section by section
-- in the Supabase SQL editor, adapting names to your live schema — the repo
-- does not contain the schema or the existing RLS policies.
--
-- Context: the client portal was removed from the app. The only roles are now
--   'manager' (full dashboard) and 'worker' (dashboard minus Users/Settings/Invoices).
-- The frontend maps legacy 'admin' → 'manager' in code (src/lib/authSession.ts),
-- so the app keeps working BEFORE this migration runs. Any role that is not
-- manager/worker/admin (including legacy 'client' and 'pending') is denied.
--
-- ⚠️ ORDER MATTERS: update the RLS policies (section 4) in the SAME session as
-- the role-value update (section 1). If you flip the values while policies
-- still check role = 'admin', managers lose all data access.

-- ── 0. Inspect current state (read-only, run first) ─────────────────────────
-- select conname, pg_get_constraintdef(oid)
--   from pg_constraint where conrelid = 'public.profiles'::regclass;
-- select policyname, tablename, qual, with_check from pg_policies where schemaname = 'public';
-- select role, count(*) from public.profiles group by role;
-- select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;

-- ── 1. Migrate existing role values ──────────────────────────────────────────
-- ⚠️ If profiles.role is a Postgres ENUM (type user_role) rather than text, the
-- trigger in section 2 (and the app) cannot write 'pending'/'manager'/'worker'
-- and you'll get: invalid input value for enum user_role. Run
-- docs/sql/fix-role-enum.sql FIRST — it ADDs those values to the enum (it does
-- not convert the column, because RLS policies depend on it). Then the legacy
-- admin → manager remap below can be run as its own query.
--
-- If section 0 revealed a CHECK constraint on profiles.role, drop it first and
-- recreate it at the end of this section.

-- update public.profiles set role = 'manager' where role = 'admin';

-- Legacy 'client' accounts keep their row but can no longer log into the app.
-- To remove them entirely (also deletes their auth accounts):
-- delete from auth.users
--   where id in (select id from public.profiles where role = 'client');
-- delete from public.profiles where role = 'client';

-- Optional tight constraint once values are migrated:
-- alter table public.profiles
--   add constraint profiles_role_check check (role in ('manager', 'worker', 'pending', 'client'));

-- ── 2. New-account trigger (SECURITY: must NOT trust client metadata) ────────
-- The Supabase signup API is publicly reachable with the anon key, so the
-- trigger must never honour a client-supplied role. Every new auth user gets
-- the non-staff role 'pending' (denied by the app); the manager's dashboard
-- flow then sets the real role via the `manage-users` edge function (service
-- role, manager-gated). Nobody can self-assign manager/worker.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Create the trigger only if none exists yet (check section 0 output; if your
-- project already has one under another name, replace THAT function instead).
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created' and tgrelid = 'auth.users'::regclass
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end;
$$;

-- Recommended: disable public signups in Supabase Dashboard →
-- Authentication → Providers → Email → "Allow new users to sign up". The
-- dashboard's "new user" form creates accounts through the `manage-users`
-- edge function (service role, admin.createUser), which is unaffected by that
-- setting — so turning signups off closes the only self-registration path
-- without breaking manager-driven account creation.

-- ── 3. Role helper for policies ──────────────────────────────────────────────
-- security definer lets it read profiles without recursing into profiles' RLS.

create or replace function public.current_staff_role()
returns text
language sql
security definer set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ── 4. RLS policies (ADAPT NAMES to your section-0 output) ───────────────────
-- Every policy that checks role = 'admin' must be updated in the same session
-- as section 1. Two tiers:
--
--   Staff (manager + worker): projects, categories, services, project_media,
--     project_services, requests, blog_posts, clients, storage buckets.
--     using / with check: public.current_staff_role() in ('manager', 'worker')
--
--   Manager only: invoices, profiles (managing OTHER rows).
--     using / with check: public.current_staff_role() = 'manager'
--
-- Example — profiles (required by the Users section AND by dashboard user
-- creation, which upserts the new profile row from the manager's session):
--
-- drop policy if exists "Profiles are viewable by admins" on public.profiles;
-- create policy "Staff can view profiles" on public.profiles
--   for select using (
--     id = auth.uid() or public.current_staff_role() in ('manager', 'worker')
--   );
-- create policy "Managers manage profiles" on public.profiles
--   for all using (public.current_staff_role() = 'manager')
--   with check (public.current_staff_role() = 'manager');
--
-- Example — invoices become manager-only:
--
-- drop policy if exists "Admins manage invoices" on public.invoices;
-- create policy "Managers manage invoices" on public.invoices
--   for all using (public.current_staff_role() = 'manager')
--   with check (public.current_staff_role() = 'manager');
--
-- Keep the public-facing policies unchanged: anonymous insert on requests
-- (the /request form) and public select on published projects/blog/services.
--
-- ── 5. Cleanup note ──────────────────────────────────────────────────────────
-- The dashboard's "delete user" (manage-users edge function) removes BOTH the
-- auth account and the profiles row, so no orphan cleanup is normally needed.
-- If you ever create auth users outside the app, you can still sweep orphans:
-- delete from auth.users u
--   where not exists (select 1 from public.profiles p where p.id = u.id);
