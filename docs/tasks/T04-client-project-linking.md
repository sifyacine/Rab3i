# T04 — Client ↔ project linking & real counts

**Status:** 🔧 todo · **Priority:** MEDIUM · **Effort:** L

## Why
`clients.projects_count` and `clients.total_spent` are columns that **nothing ever writes** — they always show the default/stale value in the clients list and on the client details page. The root cause: the `projects` table has **no `client_id`**, so there is no relationship between a client and their projects/invoices to aggregate from. The client details "Quick stats" and the clients-list "projects" column are therefore not real.

## Scope
- **DB:** relate projects (and optionally invoices) to clients; maintain the counts.
- **Frontend:** surface the real relationship.

## Steps
1. **Schema (docs/sql):**
   - `alter table projects add column if not exists client_id uuid references clients(id) on delete set null;`
   - (optional) `alter table invoices add column if not exists client_id uuid references clients(id) on delete set null;`
   - Maintain `clients.projects_count` (and `total_spent`) either via a trigger on `projects`/`invoices`, or drop the stored columns and compute on read with an aggregate/`count`.
2. **Backfill:** if there's existing data, populate `client_id` where inferable, then recompute counts.
3. **Service:** `projectsService`/`clientsService` — accept/return `client_id`; add a `getClientProjects(clientId)` if you want the list on the client page.
4. **Frontend:**
   - `ProjectForm.tsx`: add a client selector (writes `client_id`).
   - `ClientDetails.tsx`: replace the static `projects_count`/`total_spent` display with the real aggregate (and optionally list the client's projects, mirroring how `UserDetails` lists a worker's tasks).
   - `Clients.tsx`: the "projects" column reads the maintained/aggregated count.

## Files
`docs/sql/*` (new), `src/services/projectsService.ts`, `src/services/clientsService.ts`, `src/pages/admin/ProjectForm.tsx`, `src/pages/admin/ClientDetails.tsx`, `src/pages/admin/Clients.tsx`.

## Acceptance criteria
- Assigning a project to a client updates that client's project count.
- The clients list and client details show the true count (not a stale stored default).
- No column is presented as a live stat while nothing maintains it.
