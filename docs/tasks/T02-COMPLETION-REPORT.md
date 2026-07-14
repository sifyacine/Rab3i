# T02 — Site Content CMS — Completion Report

**Status:** ✅ done (branch `dev`, uncommitted) · **Date:** 2026-07-14
**Task spec:** [T02-site-content-cms.md](T02-site-content-cms.md)

## What was done

The `/admin/site-content` editor was 100% mock — content lived in a `useState` literal and "save" was a `setTimeout` + toast. It is now a **real CMS** backed by the `store_settings` singleton, and the public homepage renders the saved content (falling back to its built-in copy when unset).

### Storage
Added five columns to the existing `store_settings` singleton (the row that already holds social links + invoice business info), so **no new table or RLS** — that table is already publicly readable (the Footer reads it) and manager-writable (the Settings page writes it):
`hero_title`, `hero_subtitle`, `cta_text` (text) · `process_steps`, `partners` (jsonb).

### Changes
| Area | File | Change |
|---|---|---|
| Schema | `docs/sql/2026-07-14-site-content.sql` (new) | `alter table store_settings add column …` ×5. **Run in the Supabase SQL editor.** |
| Service | `src/services/siteContentService.ts` (new) | `getSiteContent()` (reads the columns, `maybeSingle`), `updateSiteContent()` (updates the singleton, or inserts one if none), and `SITE_CONTENT_DEFAULTS` — the built-in copy used as both the editor seed and the public fallback (single source of truth). |
| Editor | `src/pages/admin/SiteContent.tsx` | Loads content via React Query, seeds an editable local state, saves via a mutation + `["site-content"]` invalidation. **`setTimeout` stub removed.** |
| Homepage | `HeroSection`, `ProcessSection`, `ClientsSection`, `CTASection` | Read the same `["site-content"]` query (React Query dedupes to one request) and fall back to `SITE_CONTENT_DEFAULTS`: hero title/subtitle, the process steps (icons cycled by index), the partners marquee, and the CTA button text. |

## Verification
- **Type-check + build:** clean. **Tests:** `63 passed` (unchanged — this feature is UI/data wiring).
- **Adversarial review:** a 10-agent workflow (3 lenses → per-finding verification). Confirmed findings and their resolution:

| Finding | Severity | Resolution |
|---|---|---|
| A load error left the editor on an infinite spinner (content never seeded) | MEDIUM | **Fixed** — the editor now seeds from defaults once the query settles (success *or* error), so it's always editable. |
| A cleared field was stored as `""` → homepage showed the default but the editor showed blank | LOW | **Fixed** — cleared scalar fields are now stored as `null`, so "cleared = default" consistently in both places. |
| Customized content flashes the built-in defaults before the async query resolves | LOW | **Documented** (below) — acceptable; only visible on the first uncached paint of a customized site. |
| An explicitly-emptied partners/process list reverts to defaults | LOW | **By design** — an empty marquee/steps section would look broken, so empty ⇒ show the built-in copy. |
- Two review claims about a `NOT NULL` failure on first insert were **refuted** (the constraint couldn't be verified and the singleton row already exists in this project).

## Known limitations (documented)
- **First-paint flash:** on a customized site, the homepage briefly shows the built-in copy before the content query resolves, then swaps in the saved content. Low impact (only when saved content differs from defaults, and only on the first uncached load). A full fix would need SSR/prefetch, which is out of scope.
- **Empty lists show defaults:** clearing *all* partners or process steps makes those sections render the built-in copy rather than an empty section (intentional).

## To deploy
1. Run `docs/sql/2026-07-14-site-content.sql` in the Supabase SQL editor.
2. Ship the frontend (merge `dev` → `main`).
