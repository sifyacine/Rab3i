-- ============================================================================
-- FIX: user_role enum is missing 'pending' / 'manager' / 'worker'
-- ============================================================================
-- Symptom:
--   ERROR: 22P02: invalid input value for enum user_role: "pending"
--   (raised by the handle_new_user trigger — fails EVERY account creation: the
--    seed script, the manage-users edge function's "create", and signups.)
--
-- profiles.role is a Postgres ENUM (user_role) created with the OLD values
-- (e.g. 'admin' / 'client'). We simply ADD the new values to the enum.
--
-- Why not convert the column to text? RLS policies reference profiles.role
-- (e.g. "Admin can manage services"), and Postgres refuses to alter a column's
-- type while a policy depends on it:
--   ERROR: cannot alter type of a column used in a policy definition
-- Extending the enum avoids touching the column type or any policy.
--
-- HOW TO RUN: execute the three ALTER TYPE lines below in the Supabase SQL
-- editor. They are idempotent (IF NOT EXISTS). A newly added enum value cannot
-- be USED in the same transaction it was added in, so the OPTIONAL legacy remap
-- at the bottom must be run as a SEPARATE query afterwards.
-- (If your enum is not in the public schema, adjust the schema qualifier.)
-- ============================================================================

alter type public.user_role add value if not exists 'pending';
alter type public.user_role add value if not exists 'manager';
alter type public.user_role add value if not exists 'worker';

-- Confirm the values now exist (should include pending/manager/worker):
-- select enum_range(null::public.user_role);


-- ── OPTIONAL: remap legacy rows (run as a SEPARATE query, AFTER the above) ────
-- Skip entirely if you are about to run reset-all-users.sql (it clears profiles).
-- Must be a separate execution: 'manager' cannot be used in the same
-- transaction that added it.
--
-- update public.profiles set role = 'manager' where role = 'admin';
-- Legacy 'client' rows stay (the app denies them); to remove instead:
-- delete from public.profiles where role = 'client';
