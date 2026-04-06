# Rab3i — Agent Context (OpenCode)

This repo is a **React 18 + Vite + TypeScript** app with **Tailwind + shadcn/ui** and a **Supabase** backend (Auth + Postgres + Storage).

## Golden rules (for agents)

- Work on the **`dev`** branch only. **Never push directly to `main`.** The `main` branch is live on Netlify; the user will explicitly say when to merge/push to `main`, or will do it themselves.
- Prefer **small, reversible diffs**. Avoid broad refactors unless explicitly requested.
- Use existing patterns:
  - Routing is defined in **`src/App.tsx`** (all routes inline)
  - Server state uses **React Query** (`@tanstack/react-query`)
  - “Global” client state uses **Context** (`src/contexts/*`)
  - Supabase client is **`src/lib/supabase.ts`** and services are **`src/services/*.ts`**

## Quick commands

```bash
npm install
npm run dev
npm test
npm run build
npm run lint
```

## Entrypoints / architecture map

- App mount: **`src/main.tsx`** → renders `<App />`
- Routing + providers: **`src/App.tsx`**
  - Providers order: React Query → TooltipProvider → Toasters → AuthProvider → RefreshProvider → BrowserRouter
- Pages:
  - Public: **`src/pages/public/*`**
  - Admin: **`src/pages/admin/*`** (nested under `/admin/*`)
  - Client portal: **`src/pages/portal/*`** (nested under `/portal/*`)
- Route protection: **`src/components/auth/ProtectedRoute.tsx`**

## Supabase requirements

Required env vars (Vite):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Supabase client:

- **`src/lib/supabase.ts`** exports `supabase` and `validateAndRefreshSession()`

⚠️ **Pitfall:** when env vars are missing, `supabase` is set to `null as any`. Many services/pages call `supabase.from(...)` without guards → runtime crash. Ensure env vars exist before testing any DB-backed pages.

## Domain/services map (Supabase tables/buckets)

Service modules (read these first when debugging DB issues):

- `src/services/blogService.ts`
  - table: `blog_posts`
  - storage bucket: `blog-images`
- `src/services/projectsService.ts`
  - tables: `projects`, `categories`, `project_media`, `project_services`, `services`
  - RPC: `increment_project_views`
- `src/services/requestsService.ts`
  - table: `requests`
- `src/services/servicesService.ts`
  - tables: `services`, junction: `project_services`
- `src/services/categoryService.ts`
  - table: `categories`
- `src/services/mediaService.ts`
  - storage bucket: `projects-media`
  - table: `project_media`

## Testing

- Unit/integration: **Vitest**
  - config: `vitest.config.ts`
  - setup: `src/test/setup.ts`
  - example: `src/test/example.test.ts`
- E2E: **Playwright configured** (`playwright.config.ts`) but **no `tests/` directory currently**.

## Known fragile areas (watch-outs)

- `requestsService.getMyRequests()` appears to return all rows; rely on RLS to prevent leakage.
- Blog slug generation may collapse Arabic titles to empty/duplicates.
- Blog view counting is read-then-update (lost update risk under concurrency).
- `servicesService.setProjectServices()` does delete-then-insert without a transaction.
- Playwright config expects app on `http://localhost:8080` and tests under `./tests`.

## How to explore this repo quickly (agent workflow)

1) Start with `src/App.tsx` (routes + main layouts).
2) For any page feature, locate the page component in `src/pages/**`.
3) Find data access in `src/services/**`.
4) Trace Supabase tables/buckets used by that service.
5) Only then decide what to change.
