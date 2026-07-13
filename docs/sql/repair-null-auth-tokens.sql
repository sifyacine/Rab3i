-- ============================================================================
-- REPAIR: "Database error querying schema" on some accounts
-- ============================================================================
-- Symptom: certain accounts fail login/token calls with
--   {"code":"unexpected_failure","message":"Database error querying schema"}
-- while others work fine.
--
-- Cause: GoTrue reads several auth.users columns into non-nullable Go strings.
-- If any of those token columns is NULL (accounts imported or created by raw
-- SQL/tools often are), the scan fails for THAT row only — hence "some
-- accounts". Setting the NULLs to '' fixes it without touching passwords.
--
-- This is non-destructive: it only rewrites NULL → '' on token/text columns
-- that exist in your GoTrue version. Run in the Supabase SQL editor.
-- ============================================================================

do $$
declare
  col text;
  cols text[] := array[
    'confirmation_token',
    'recovery_token',
    'email_change',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change',
    'phone_change_token',
    'reauthentication_token'
  ];
  fixed int;
begin
  foreach col in array cols loop
    -- Only touch columns that actually exist in this project's schema
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'auth' and table_name = 'users' and column_name = col
    ) then
      execute format('update auth.users set %I = '''' where %I is null', col, col);
      get diagnostics fixed = row_count;
      if fixed > 0 then
        raise notice 'auth.users.% : fixed % NULL row(s)', col, fixed;
      end if;
    end if;
  end loop;
end $$;

-- Optional: list accounts that still lack a confirmed email or an identity row
-- (another cause of login trouble, unrelated to the NULL-token issue):
-- select u.email,
--        u.email_confirmed_at is not null as confirmed,
--        exists (select 1 from auth.identities i where i.user_id = u.id) as has_identity
--   from auth.users u
--  order by u.created_at;
