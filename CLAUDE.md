# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> A sibling `AGENTS.md` (written for OpenCode) covers the same ground with extra detail on the git workflow, the per-service Supabase table map, and known-fragile areas. Read it when debugging DB issues or before merging to `main`.

## Commands

Node version is pinned in `.nvmrc` (22.18.0).

```bash
npm install
npm run dev          # Vite dev server
npm run build        # production build → dist/
npm run build:dev    # build with development mode/sourcemaps
npm run lint         # ESLint over the repo
npm test             # Vitest, single run
npm run test:watch   # Vitest watch mode
npm run preview      # serve the built dist/
```

Run a single test file or test by name:

```bash
npx vitest run src/lib/authSession.test.ts
npx vitest run -t "needsRoleRefresh"
```

Playwright is configured (`playwright.config.ts`) for E2E but **there is no `tests/` directory yet**; its `baseURL` is `http://localhost:8080`, which does **not** match Vite's default dev port — verify the port before writing E2E tests.

## Stack

React 18 + Vite (v8, SWC) + TypeScript + Tailwind + shadcn/ui (Radix primitives), with a Supabase backend (Auth + Postgres + Storage). Server state via React Query; forms via react-hook-form + zod; PDFs via `@react-pdf/renderer`; animation via framer-motion. Import alias `@/*` → `src/*`.

The app is **Arabic / right-to-left** (`index.html` sets `lang="ar" dir="rtl"`, font `KOSans`). Keep new UI RTL-correct and Arabic-first.

TypeScript is configured loosely (`strict: false`, unused-vars off in both tsconfig and ESLint) — don't rely on the type checker to catch everything.

## Architecture

This is a single SPA serving **two distinct audiences**, split by route prefix and role:

- **Public site** (`/`, `/services`, `/portfolio`, `/blog`, `/about`, `/request`, login/password pages) → `src/pages/public/*` and top-level `src/pages/*`. There is **no public signup** — staff accounts are created by managers from the dashboard's Users section.
- **Staff dashboard** (`/admin/*`) → `src/pages/admin/*`, gated by `allowedRoles={["manager", "worker"]}`, wrapped in `AdminDashboardLayout`. The Users, Settings, Invoices, and Tasks-management sections are additionally wrapped manager-only (`ManagerOnly` in `App.tsx`), and hidden from the sidebar for workers. Workers get `/admin/my-tasks` (their assigned tasks, status + notes updates) and everyone gets `/admin/profile`. Tasks have no notification system by design — the manager contacts workers directly. DB schema/RLS for tasks: `docs/sql/2026-07-13-tasks-system.sql`.

There is **no client-facing portal**: clients exist only as CRM records (`clients` table, admin Clients section) and cannot log in.

**All routing lives inline in [`src/App.tsx`](src/App.tsx)** — there is no route config file. Adding a page means adding an `import` and a `<Route>` there. Provider nesting order is deliberate: `QueryClientProvider` → `TooltipProvider` → Toasters → `AuthProvider` → `RefreshProvider` → `BrowserRouter`.

### Auth & roles (the subtle part)

- Supabase Auth session is managed in [`src/contexts/AuthContext.tsx`](src/contexts/AuthContext.tsx). Role (`"manager" | "worker"`) is resolved from the `profiles` table by user id, falling back to `user_metadata.role`, then to a live `auth.getUser()` lookup. Resolution **fails closed**: any other value (including legacy `"client"`) or a lookup failure yields `null` = no dashboard access. Legacy `"admin"` values are mapped to `"manager"` by `normalizeStaffRole` (`src/lib/authSession.ts`) so the app works before/after the DB migration (`docs/sql/2026-07-13-roles-manager-worker.sql` — run manually in the SQL editor; kept out of `supabase/migrations/` on purpose). All async auth calls are wrapped in an 8s timeout.
- `loading` = `bootstrapping || resolvingRole`. Role re-resolution on auth events is gated by `needsRoleRefresh` (`src/lib/authSession.ts`) and guarded against stale/racing requests via sequence + user-id refs.
- [`src/components/auth/ProtectedRoute.tsx`](src/components/auth/ProtectedRoute.tsx) enforces access via `allowedRoles`: redirects to `/login` when the session is invalid or `role` is `null`; a staff member lacking the required role (worker on a manager-only section) is sent back to `/admin`.
- Privileged user administration (create user, switch role, delete, ban/unban) runs through the **`manage-users` Supabase edge function** (`supabase/functions/manage-users/`), invoked by `usersService`. It runs with the service-role key and enforces the manager check server-side (it also refuses self-delete/-ban/-demote). Deploy it (`supabase functions deploy manage-users`) or those dashboard actions fail. `profiles.is_banned` mirrors the auth ban for display.
- Auth helper logic (redirect URLs, session validation, error/outcome mapping) is factored into `src/lib/auth*.ts`, most with colocated `.test.ts` files — the auth layer is where the unit tests actually are.

### Data access

- Supabase client is [`src/lib/supabase.ts`](src/lib/supabase.ts). **It is `null` when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are unset.** Most services/pages call `supabase.from(...)` without null-guards, so missing env vars crash any DB-backed page. Ensure `.env` is populated before testing those pages.
- All DB/storage access is funneled through `src/services/*.ts` (one module per domain: blog, projects, categories, services, clients, invoices, requests, media, users). When debugging a data issue, start from the relevant service to find the tables/buckets/RPCs it touches — the mapping is documented in `AGENTS.md`.
- Server/cache state is React Query. Client/global state is React Context (`src/contexts/*`). `RefreshContext` exposes `refreshData(queryKeys?)` for global or targeted query invalidation.

## Deployment

Deployed on **Netlify**; `main` auto-deploys to production. Per `AGENTS.md`, do feature work on the **`dev`** branch and never push directly to `main` — the user controls promotion. `netlify.toml` builds `npm run build` → `dist/` with an SPA catch-all redirect to `/index.html`.

Required env vars (Vite, `VITE_`-prefixed): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APP_URL` (base URL for auth email redirects; falls back to `window.location.origin`). See `.env.example`.

Supabase MCP is configured project-scoped in `opencode.json` (project ref `eyqgjpqnliagofjivisd`), not globally.
