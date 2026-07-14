# T03 — Settings: SEO, maintenance mode, notification prefs

**Status:** 🔧 todo · **Priority:** MEDIUM · **Effort:** M

## Why
The Settings page previously showed an SEO-description field (hardcoded default, never saved), a **maintenance-mode** switch (no state, nothing reads it), and notification toggles (no state, drive no behavior). These non-functional cards were **removed** in the mock-removal pass to stop them misleading. This task rebuilds them properly on top of `store_settings` (the same singleton the social links + invoice business info already use).

## Scope
- **DB:** add columns to `store_settings`.
- **Frontend:** re-add the cards in `Settings.tsx`, wired to load + save.
- **Enforcement:** actually apply maintenance mode on the public site.

## Steps
1. **Schema (docs/sql):**
   `alter table store_settings add column if not exists seo_description text;`
   `... add column if not exists maintenance_mode boolean default false;`
   `... add column if not exists notify_new_requests boolean default true;`
   `... add column if not exists notify_weekly_blog boolean default false;`
   Public read for `maintenance_mode` (+ SEO meta if used publicly); manager-only write.
2. **`Settings.tsx`:** re-add a "Site settings" card (SEO + maintenance) and a "Notifications" card, each `value`-controlled from the `store_settings` query with its own Save mutation (mirror the existing social-links card).
3. **Maintenance enforcement:** in the public shell (e.g. a wrapper around public routes in `App.tsx` or a top-level guard), read `store_settings.maintenance_mode`; if on, show a "under maintenance" page to non-staff visitors. (Staff/`/admin` unaffected.)
4. **Notifications:** if there is no delivery mechanism yet, either (a) just persist the prefs for future use, or (b) descope the notification card until an email/webhook pipeline exists — don't ship toggles that do nothing.

## Files
`docs/sql/*` (new columns), `src/pages/admin/Settings.tsx`, `src/App.tsx` (or a public layout guard), maybe `src/pages/public/*` for the maintenance screen.

## Acceptance criteria
- SEO description and maintenance flag persist and reload.
- Turning maintenance mode on shows the maintenance screen to public visitors and never to staff.
- Notification toggles either drive real behavior or are not shown.
