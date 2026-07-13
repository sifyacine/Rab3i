# Rab3i — Agent Context (OpenCode)

This repo is a **React 18 + Vite + TypeScript** app with **Tailwind + shadcn/ui** and a **Supabase** backend (Auth + Postgres + Storage).

## Git & Deployment Workflow

### Branches
- **`dev`** — Working branch for all feature work and bugfixes
- **`main`** — Production branch, auto-deployed to Netlify

### Recommended Workflow

| Step | Action | Why |
|------|--------|-----|
| 1 | Work on `dev` branch | Local testing |
| 2 | Push to `origin/dev` | Triggers Netlify **preview** deploy (not production) |
| 3 | Test on preview | Verify feature works |
| 4 | Create PR `dev` → `main` | Netlify auto-detects PRs as preview deploys |
| 5 | Merge PR | Netlify auto-deploys to production |

### Why PRs over direct push
- **Preview deploys**: Every PR gets its own Netlify URL for testing before production
- **Safety**: Catch bugs on preview, not live site
- **History**: Clean record of what went to production

### Golden rules (for agents)

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
  - Public: **`src/pages/public/*`** (no signup page — accounts are created by managers from `/admin/users`)
  - Staff dashboard: **`src/pages/admin/*`** (nested under `/admin/*`)
- Route protection: **`src/components/auth/ProtectedRoute.tsx`** (`allowedRoles` prop)
- Roles: **`manager`** (full dashboard) and **`worker`** (dashboard minus Users/Settings/Invoices/Tasks-management). Legacy `admin` DB values map to `manager` in code (`src/lib/authSession.ts`); legacy `client` accounts are denied. There is **no client portal** — clients are CRM records only. DB-side migration (run manually, step by step): `docs/sql/2026-07-13-roles-manager-worker.sql`.
- Tasks: managers create/assign at `/admin/tasks`; workers work their queue at `/admin/my-tasks` (status + notes). No automatic notifications — the manager tells workers to check their tasks. Every staff member edits their own name/phone at `/admin/profile` (via the `update_own_profile` RPC, so `role` can't be self-changed).
- User management: managers add users, switch roles, ban/unban, and delete from `/admin/users` — all through the **`manage-users` edge function** (service role, manager-gated, self-action-guarded). It must be deployed (`supabase functions deploy manage-users`) or those actions error. `profiles.is_banned` mirrors `auth.users.banned_until` for the UI.

## Supabase requirements

### Project
- **Project Ref**: `eyqgjpqnliagofjivisd`
- **Region**: West EU (Ireland)
- **MCP**: Local config in `opencode.json` (project-scoped, not global)
  - To authenticate: `opencode mcp auth supabase`
  - Tools available: `supabase_*` (list_tables, execute_sql, apply_migration, etc.)

Required env vars (Vite):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL` (for email redirects, e.g., `https://rab3i.netlify.app`)

Supabase client:

- **`src/lib/supabase.ts`** exports `supabase` and `validateAndRefreshSession()`. Privileged staff-account creation no longer uses a browser signup client — it goes through the `manage-users` edge function.

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
- `src/services/usersService.ts`
  - table: `profiles` (read/list, own-profile RPC)
  - **edge function `manage-users`** for privileged actions — `createUser` / `setUserRole` / `deleteUser` / `banUser` / `unbanUser` all `functions.invoke("manage-users", …)`. The function (service role) verifies the caller is a manager, then uses `auth.admin.*`. Source + deploy steps: `supabase/functions/manage-users/`.
- `src/services/clientsService.ts`
  - table: `clients` (CRM records only — no login)
- `src/services/invoicesService.ts`
  - table: `invoices` (manager-only section)
- `src/services/tasksService.ts`
  - table: `tasks` (managers assign; workers read/update only their own via RLS)
  - embeds: `profiles!assigned_to` (assignee), `projects!project_id`
  - schema + RLS: `docs/sql/2026-07-13-tasks-system.sql` (also adds `profiles.phone` / `profiles.job_title` and the `update_own_profile` RPC)

## Testing

- Unit/integration: **Vitest**
  - config: `vitest.config.ts`
  - setup: `src/test/setup.ts`
  - example: `src/test/example.test.ts`
- E2E: **Playwright configured** (`playwright.config.ts`) but **no `tests/` directory currently**.

## Known fragile areas (watch-outs)

- RLS policies in Supabase may still reference the legacy `admin`/`client` roles — walk through `docs/sql/2026-07-13-roles-manager-worker.sql` in the Supabase SQL editor (deliberately NOT in `supabase/migrations/`, so `db push` can't apply it blindly) or workers will hit RLS errors on staff tables.
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
