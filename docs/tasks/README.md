# Mock-Data Removal — Work Division

Companion to [`../2026-07-14-features-not-wired-to-backend.md`](../2026-07-14-features-not-wired-to-backend.md).
This folder divides the remaining "not wired to the backend" work into assignable task files.

**Legend:** ✅ done · 🔧 todo · priority `HIGH` / `MEDIUM` / `LOW` · effort `S` (hours) / `M` (a day) / `L` (multi-day, needs schema).

---

## ✅ Already removed this pass (frontend-only, existing services)

These were fixed directly because a real service/table already existed — no schema work needed. Do **not** redo them.

| Feature | File | What changed |
|---|---|---|
| Service details page | `src/pages/admin/ServiceDetails.tsx` | Now fetches `servicesService.getServiceById(id)`; real fields; delete calls `deleteService`. |
| Project details page | `src/pages/admin/ProjectDetails.tsx` | Now fetches new `projectsService.getProjectById(id)`; shows real project + media + linked services; delete calls `deleteProject`. **Fictional milestones / completion % / "client approval" UI removed.** |
| Client details page | `src/pages/admin/ClientDetails.tsx` | Now fetches `clientsService.getClientById(id)`; real fields + `mailto:`/`tel:`; delete calls `deleteClient`. |
| Invoice details page | `src/pages/admin/InvoiceDetails.tsx` | Now fetches `invoicesService.getInvoiceById(id)`; dead Print/PDF/Share buttons replaced by the shared `InvoicePreviewDialog` (real print + PDF); fake line-items/received-amount/notes removed. |
| Dashboard "Active clients" card | `src/pages/admin/DashboardHome.tsx` | Was a duplicate of the projects count; now counts real active `clients`. |
| Homepage services grid | `src/components/home/ServicesSection.tsx` | Now reads `servicesService.getServices(true)`; falls back to a curated list only if the DB has none. |
| Clients row "Message"/"Call" | `src/pages/admin/Clients.tsx` | No-op handlers → real `mailto:` / `tel:` links. |
| Blog "Comments" menu item | `src/pages/admin/Blog.tsx` | Dead no-op item removed (see `T05` to build the feature). |
| Settings page | `src/pages/admin/Settings.tsx` | Hardcoded profile → real read-only profile + link to `/admin/profile`; misleading global "Save" button and the non-functional SEO/maintenance/notification cards removed (see `T02`/`T03` to build them). Theme + social-links cards were already wired and kept. |
| New service method | `src/services/projectsService.ts` | Added `getProjectById(id)` with the same embeds as `getProjectBySlug`. |

All of the above type-check, build, and pass the test suite.

---

## 🔧 Remaining tasks (need new backend / schema)

| # | Task | Priority | Effort | One-liner |
|---|---|---|---|---|
| [T01](T01-invoice-line-items.md) | Invoice line items + VAT | MEDIUM | L | Persist itemised billing; make the PDF total match the record. |
| [T02](T02-site-content-cms.md) | Site Content CMS | MEDIUM | L | The `/admin/site-content` editor is still 100% mock — back it with a table. |
| [T03](T03-store-settings.md) | Settings: SEO / maintenance / notifications | MEDIUM | M | Add `store_settings` columns + wire (and enforce maintenance mode). |
| [T04](T04-client-project-linking.md) | Client ↔ project linking & counts | MEDIUM | L | `projects` has no `client_id`; the clients "projects" count is unmaintained. |
| [T05](T05-blog-comments.md) | Blog comments | LOW | M | Build a comments table + moderation, or leave removed. |

### Suggested division
- **Person A (frontend + light SQL):** T03 → T02 (both are form-to-table wiring once columns exist).
- **Person B (data model):** T04 (schema + backfill) → T01 (line-items table + PDF), since both touch invoicing/CRM relationships.
- **Backlog / optional:** T05 only if the product wants public blog comments.

Each task file lists scope, concrete steps, files, and acceptance criteria.
