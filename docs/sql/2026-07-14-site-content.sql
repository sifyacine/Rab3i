-- ============================================================================
-- T02 — Site Content CMS  (RUN MANUALLY in the Supabase SQL editor)
-- ============================================================================
-- Makes the /admin/site-content editor real by storing the editable homepage
-- content on the existing store_settings singleton (the same row that already
-- holds social links + invoice business info). The public homepage reads these
-- columns and falls back to its built-in copy when they are null.
--
-- store_settings is already publicly readable (the site Footer + homepage read
-- it with the anon key) and manager-writable (the Settings page updates it), so
-- no new RLS is required — we only add columns.
-- ============================================================================

alter table public.store_settings add column if not exists hero_title    text;
alter table public.store_settings add column if not exists hero_subtitle text;
alter table public.store_settings add column if not exists cta_text      text;
alter table public.store_settings add column if not exists process_steps jsonb;   -- [{ "title": "...", "description": "..." }, ...]
alter table public.store_settings add column if not exists partners      jsonb;   -- ["اسم شريك", ...]

-- store_settings is a singleton and already has a row in this project (the
-- social links + invoice business info live on it). If a fresh project has no
-- row yet, the app's siteContentService inserts one on first save; you can also
-- create it manually with your own required columns, e.g.:
--   insert into public.store_settings (store_name) values ('شركة ربيعي');

-- Verify:
-- select id, hero_title, hero_subtitle, cta_text, process_steps, partners
--   from public.store_settings limit 1;
