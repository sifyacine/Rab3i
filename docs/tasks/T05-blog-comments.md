# T05 — Blog comments (build or stay removed)

**Status:** 🔧 todo (optional) · **Priority:** LOW · **Effort:** M

## Why
The blog row menu used to have a "التعليقات" (Comments) action that did nothing — no comments service or table exists. The dead menu item was **removed** in the mock-removal pass. This task exists only if the product actually wants blog comments; otherwise close it.

## Scope (only if building)
- **DB:** `blog_comments` table: `id, post_id references blog_posts(id) on delete cascade, author_name, author_email, body, status ('pending'|'approved'|'spam'), created_at`. Public insert (rate-limited), manager-only read/moderate via RLS.
- **Service:** `commentsService` — list by post, moderate (approve/reject/delete), public submit.
- **Frontend (admin):** a comments view/moderation screen reachable from the blog row menu (re-add the menu item wired to it).
- **Frontend (public):** a comment form + approved-comments list on `src/pages/public/BlogDetail.tsx`.

## Acceptance criteria
- Visitors can submit a comment; it lands as `pending`.
- Managers can approve/reject; only approved comments show publicly.
- No dead/no-op menu item.

## If not building
Close this task — the dead item is already gone, so there is nothing misleading left.
