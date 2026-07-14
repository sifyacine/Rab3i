-- ============================================================================
-- T03 — Settings: SEO description, maintenance mode, notification prefs
-- ============================================================================
-- Adds the columns behind the Settings page's "Site settings" and
-- "Notifications" cards, on the existing store_settings singleton (already
-- publicly readable + manager-writable — no new RLS). Run in the Supabase SQL
-- editor.
--
--   • seo_description       — meta description used by the public site
--   • maintenance_mode      — when true, public visitors see a maintenance page
--                             (staff/dashboard are unaffected)
--   • notify_new_requests   — manager preference (persisted for future delivery)
--   • notify_weekly_blog    — manager preference (persisted for future delivery)
-- ============================================================================

alter table public.store_settings add column if not exists seo_description     text;
alter table public.store_settings add column if not exists maintenance_mode    boolean not null default false;
alter table public.store_settings add column if not exists notify_new_requests boolean not null default true;
alter table public.store_settings add column if not exists notify_weekly_blog  boolean not null default false;

-- Verify:
-- select seo_description, maintenance_mode, notify_new_requests, notify_weekly_blog
--   from public.store_settings limit 1;
