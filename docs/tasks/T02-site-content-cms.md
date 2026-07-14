# T02 — Site Content CMS (back the editor with a table)

**Status:** 🔧 todo · **Priority:** MEDIUM · **Effort:** L

## Why
`/admin/site-content` (`SiteContent.tsx`) presents an editor for the homepage hero title/subtitle, the process steps, the partners list, and the CTA text — but the content lives in one `useState` literal and `handleSave` is a `setTimeout` + success toast. **Nothing loads from or saves to the DB**, and the public homepage sections (`src/components/home/*`) render their own hardcoded copy, so the "manage site content" section is a facade. This page was left as-is on purpose because it needs a backing store.

## Scope
- **DB:** a place to store editable homepage content.
- **Service:** load/save that content.
- **Frontend:** wire `SiteContent.tsx` to load + persist; make the relevant `home/*` sections read the same source.

## Steps
1. **Schema (docs/sql):** either
   - add columns to the existing `store_settings` singleton (e.g. `hero_title`, `hero_subtitle`, `cta_text`, `process_steps jsonb`, `partners jsonb`), **or**
   - a dedicated `site_content` table keyed by `section`.
   Add manager-only RLS for writes, public read for the fields the homepage needs.
2. **Service:** add a `siteContentService` (or extend a settings service) with `get()` and `update()`.
3. **`SiteContent.tsx`:** load real values into state on mount; `handleSave` → real update + query invalidation; remove the `setTimeout` stub.
4. **Homepage:** update the sections that should be editable (`HeroSection`, `ProcessSection`, `ClientsSection`/partners, `CTASection`) to read from the service, with the current copy as fallback (same pattern already used in `ServicesSection.tsx`).

## Files
`docs/sql/*` (new), new `src/services/siteContentService.ts`, `src/pages/admin/SiteContent.tsx`, `src/components/home/{HeroSection,ProcessSection,ClientsSection,CTASection}.tsx`.

## Acceptance criteria
- Editing hero/process/CTA/partners in the dashboard and reloading shows the saved values.
- The public homepage reflects the saved content (fallback only when unset).
- No `setTimeout`-fake save remains.

## Note
Until this ships, `SiteContent.tsx` is a **non-functional facade** — consider hiding the sidebar link or adding a "not yet saved to the server" note if it will linger.
