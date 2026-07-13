-- ============================================================================
-- RESET ALL USERS  — deletes every auth account and profile
-- ============================================================================
-- ⚠️ DESTRUCTIVE. Run in the Supabase SQL editor (postgres role). There is no
-- undo. Use this to get a clean slate before seeding test users.
--
-- What it does:
--   • clears tasks (they reference profiles)
--   • detaches requests from users (keeps the guest requests themselves)
--   • deletes every profiles row
--   • deletes every auth.users row — this cascades to auth.identities,
--     auth.sessions, auth.refresh_tokens, auth.mfa_factors, etc.
--
-- If you also want to wipe the submitted request records, uncomment the delete
-- in the block below instead of the update.
-- ============================================================================

do $$
begin
  if to_regclass('public.tasks') is not null then
    delete from public.tasks;
  end if;

  if to_regclass('public.requests') is not null then
    update public.requests set user_id = null where user_id is not null;
    -- delete from public.requests;   -- ← use this instead to remove all requests
  end if;

  if to_regclass('public.profiles') is not null then
    delete from public.profiles;
  end if;
end $$;

-- Removing the auth users cascades to all auth-schema child rows.
delete from auth.users;

-- Sanity check (should both be 0):
-- select count(*) as auth_users from auth.users;
-- select count(*) as profiles   from public.profiles;
