# `manage-users` edge function

Privileged user administration for **managers**. Runs with the service-role key
(bypasses RLS), so the manager check is enforced inside the function.

## What it does

| action     | body                                                        | effect                                                   |
|------------|-------------------------------------------------------------|----------------------------------------------------------|
| `create`   | `email, password, full_name, role, phone?, job_title?`      | creates a confirmed auth user + `profiles` row            |
| `set_role` | `userId, role` (`manager` \| `worker`)                       | switches a user's role                                    |
| `delete`   | `userId`                                                     | deletes the auth account **and** the `profiles` row       |
| `ban`      | `userId`                                                     | bans (blocks login) indefinitely, sets `profiles.is_banned`|
| `unban`    | `userId`                                                     | lifts the ban                                             |

Guards: the caller must be a `manager` (legacy `admin` accepted); `set_role`,
`delete`, and `ban` refuse to act on the caller's own account (no self-lockout).

## Prerequisites (run once)

1. Apply `docs/sql/2026-07-13-roles-manager-worker.sql` and
   `docs/sql/2026-07-13-tasks-system.sql` (roles + `profiles.is_banned` etc.).
2. The client calls this via `supabase.functions.invoke("manage-users", …)`
   (see `src/services/usersService.ts`), which forwards the manager's JWT.

## Deploy

```bash
# from the repo root, with the Supabase CLI logged in and linked
supabase functions deploy manage-users --project-ref eyqgjpqnliagofjivisd
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are injected
automatically — do **not** commit the service-role key anywhere.

## Local test

```bash
supabase functions serve manage-users
# then POST with a manager's access token:
curl -i http://localhost:54321/functions/v1/manage-users \
  -H "Authorization: Bearer <MANAGER_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"action":"ban","userId":"<uuid>"}'
```
