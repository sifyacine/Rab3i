-- ============================================================================
-- SEED TEST USERS — one manager + one worker
-- ============================================================================
-- Run in the Supabase SQL editor AFTER reset-all-users.sql, the roles + tasks
-- SQL, AND fix-role-enum.sql. That last one is required if profiles.role is a
-- Postgres enum: otherwise the handle_new_user trigger's 'pending' insert fails
-- with "invalid input value for enum user_role" and this seed cannot run.
--
--   manager : sifyacine2003@gmail.com   / Qwerty!23456
--   worker  : ycn585@gmail.com          / Qwerty!23456
--
-- Creates each account fully and correctly so it can log in immediately:
--   • auth.users row with a bcrypt password and confirmed email
--   • all token columns set to '' (NOT NULL) — this is what prevents the
--     "Database error querying schema" login failure
--   • matching auth.identities row (email provider)
--   • public.profiles row with the right role (upserts over the 'pending' row
--     that handle_new_user may insert)
--
-- Idempotent: re-running replaces the same two accounts.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;

-- Temporary helper so we don't repeat the insert boilerplate.
create or replace function public._seed_staff_user(
  p_email      text,
  p_password   text,
  p_role       text,
  p_full_name  text
) returns uuid
language plpgsql
security definer
set search_path = public, extensions, auth
as $$
declare
  uid uuid;
begin
  -- Replace any existing account with this email for a clean re-seed.
  delete from auth.users where email = lower(p_email);

  uid := gen_random_uuid();

  insert into auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    -- token columns are NOT NULL in GoTrue's schema; '' keeps login healthy
    confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) values (
    '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', lower(p_email),
    crypt(p_password, gen_salt('bf')), now(),
    now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name),
    '', '', '', ''
  );

  insert into auth.identities (
    provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values (
    lower(p_email), uid,
    jsonb_build_object(
      'sub', uid::text,
      'email', lower(p_email),
      'email_verified', true,
      'phone_verified', false
    ),
    'email', now(), now(), now()
  );

  -- handle_new_user (if present) may have inserted a 'pending' row; upsert the
  -- authoritative role. profiles.role is the user_role enum, so cast the text
  -- argument to it (the value must already exist in the enum — run
  -- fix-role-enum.sql first).
  insert into public.profiles (id, email, full_name, role)
  values (uid, lower(p_email), p_full_name, p_role::public.user_role)
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        role = excluded.role;

  return uid;
end;
$$;

select public._seed_staff_user('sifyacine2003@gmail.com', 'Qwerty!23456', 'manager', 'Sif Yacine');
select public._seed_staff_user('ycn585@gmail.com',        'Qwerty!23456', 'worker',  'YCN');

drop function public._seed_staff_user(text, text, text, text);

-- Verify:
-- select p.email, p.role, u.email_confirmed_at is not null as confirmed
--   from public.profiles p join auth.users u on u.id = p.id
--  order by p.role;
