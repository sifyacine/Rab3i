# Features Not Wired to the Backend

This report catalogs every user-facing feature in the Rab3i staff dashboard that presents itself as backed by the database but is not — mock/hardcoded data rendered as real, actions that only toast success, stats that are faked or duplicated, and settings whose changes are never persisted. It reflects branch **`dev`** as of the audit (2026-07-14) and is based only on confirmed findings.

> **Update (2026-07-14):** Every gap that could be fixed with an existing service has been fixed — the four "details" pages (service/project/client/invoice) now load real records and their deletes work, the fictional project milestones/approval UI was removed, the dashboard "active clients" number and homepage services grid are DB-backed, the client Message/Call actions and blog "Comments" item were fixed/removed, and the Settings page now shows the real profile (misleading global save + fake SEO/maintenance/notification cards removed). The remaining gaps require new schema/tables and are divided into task files under [`tasks/`](tasks/README.md) (T01 invoice line items, T02 site-content CMS, T03 store-settings SEO/maintenance/notifications, T04 client↔project linking, T05 blog comments). The rows below describe the **original** audit state.

---

## Summary of real gaps

Sorted high → low severity.

| Feature | Location (file:line) | What happens now | Should use | Severity |
|---|---|---|---|---|
| Service details page — viewing a service's full info | `src/pages/admin/ServiceDetails.tsx:29` | Renders a hardcoded mock `service` object; route `id` used only for the edit link, never to fetch. Every `/admin/services/:id` shows identical fabricated content. | `servicesService.getServiceById(id)` → `services` table | HIGH |
| Project details page — viewing a portfolio project | `src/pages/admin/ProjectDetails.tsx:39` | Hardcoded `project` object in `useState`; `id` param ignored. Every project id renders the same fake project, with fields that don't exist in schema. | `projectsService.getProjects()`/`getProjectBySlug` → `projects` table | HIGH |
| Project milestones + completion progress bar + "client approval" status | `src/pages/admin/ProjectDetails.tsx:51` | Milestones, computed completion %, and "معتمد من العميل" badges are all mock; no backend, table, or client portal exists for any of it. | No backend exists — feature is fiction (no milestones/approval table or client portal) | HIGH |
| Client details page — view a single client's profile/stats | `src/pages/admin/ClientDetails.tsx:30` | Hardcoded mock `client` (name, email, phone, counts); `id` used only for edit link. Every client opens the same fake person. | `clientsService.getClientById(id)` → `clients` table | HIGH |
| Invoice details page — view a single invoice | `src/pages/admin/InvoiceDetails.tsx:20` | Hardcoded mock `invoice` object; `id` used only for the edit link. Every invoice id shows identical fake data. | `invoicesService.getInvoiceById(id)` → `invoices` table | HIGH |
| Settings — top "حفظ التغييرات" (Save changes) button | `src/pages/admin/Settings.tsx:72` | Only fires `toast.success`; persists nothing. Profile/SEO/maintenance/notification cards are all unwired. | `store_settings` table (+ `profiles`/auth) via supabase | HIGH |
| Delete service button (service details page) | `src/pages/admin/ServiceDetails.tsx:39` | `confirmDelete()` only toasts success and navigates; no backend call. | `servicesService.deleteService(id)` → `services` table | MEDIUM |
| Delete project button (project details page) | `src/pages/admin/ProjectDetails.tsx:60` | `confirmDelete()` only toasts + navigates; dialog copy promises permanent DB deletion. | `projectsService.deleteProject(id)` → `projects` table | MEDIUM |
| Delete client (client details page) | `src/pages/admin/ClientDetails.tsx:43` | `confirmDelete()` only toasts + navigates; never calls the service. | `clientsService.deleteClient(id)` → `clients` table | MEDIUM |
| Invoice details buttons: Print, PDF, "Share link with client" | `src/pages/admin/InvoiceDetails.tsx:55` | Buttons have no `onClick`; do nothing. Received amount + notes are static literals. | PDF via `InvoicePDF`/`pdf()`; no share/link mechanism exists | MEDIUM |
| Invoice line items (add/remove named billing rows) | `src/pages/admin/InvoiceForm.tsx:106` | `handleSave` stores only the summed `total`; per-item titles/prices are dropped. Edit re-fabricates one fake line. | `invoice_items` table (or JSON column) via `invoicesService` | MEDIUM |
| Invoice PDF / print line-item breakdown | `src/pages/admin/Invoices.tsx:66` | PDF + print dialog hardcode a single generic line item priced at `invoice.total`. | Real line items from `invoices`/`invoice_items` | MEDIUM |
| Invoice PDF totals / VAT calculation | `src/components/admin/InvoicePDF.tsx:221` | Adds a hardcoded 15% VAT, so the PDF grand total is 15% higher than the stored/displayed amount. | Consistent total handling against `invoices.total` | MEDIUM |
| Clients list "المشاريع" (projects count) column | `src/pages/admin/Clients.tsx:65` | Reads `clients.projects_count`, which nothing ever writes; always the DB default/stale value. | Derive/maintain from `projects` table (aggregate or trigger) | MEDIUM |
| Dashboard "العملاء النشطون" (Active clients) stat card | `src/pages/admin/DashboardHome.tsx:59` | Value is `stats?.projects` — a duplicate of the projects count; clients are never queried. | `clients` via `clientsService`; extend `getProjectStats()` | MEDIUM |
| Settings — Profile card (username & email) | `src/pages/admin/Settings.tsx:106` | Hardcoded `defaultValue` literals (`admin_yassine` / `admin@rabii.sa`); not loaded or saved. | `profiles` + Supabase auth (`getUser`/`usersService`) | MEDIUM |
| Settings — Site settings: SEO description field | `src/pages/admin/Settings.tsx:153` | Uncontrolled field with a hardcoded default; never read or written. | `store_settings` (seo/meta column) via supabase | MEDIUM |
| Settings — Maintenance mode toggle | `src/pages/admin/Settings.tsx:161` | Bare `<Switch />` with no state; nothing reads a maintenance flag anywhere. | `store_settings` (maintenance_mode boolean) via supabase | MEDIUM |
| Site Content page (hero, process steps, CTA, partners) | `src/pages/admin/SiteContent.tsx:14` | Content held in one `useState` literal; `handleSave` is a `setTimeout` + toast. Nothing loaded or persisted. | `store_settings` or a `site_content` table via a service | MEDIUM |
| Homepage "خدماتنا" services grid | `src/components/home/ServicesSection.tsx:6` | Renders a hardcoded 7-item const array; no query. Diverges from the DB-backed `/services` it links to. | `servicesService.getServices(true)` → `services` table | MEDIUM |
| "التعليقات" (Comments) action in blog post row menu | `src/pages/admin/Blog.tsx:151` | Menu item has no `onClick`; clicking does nothing. Implies a comments feature that doesn't exist. | No comments service/table exists — build it or remove the item | LOW |
| Client row "Message" / "Call" quick actions | `src/pages/admin/Clients.tsx:95` | Both `onClick` handlers only call `e.stopPropagation()`; no `mailto:`/`tel:`, no service call. | At minimum `mailto:`/`tel:` channels; no DB interaction attempted | LOW |
| Settings — Notification toggles (new-request alerts, weekly blog reports) | `src/pages/admin/Settings.tsx:177` | Uncontrolled switches with no state; never saved and drive no behavior. | `store_settings` or a notification-preferences table | LOW |

---

## Content (services, projects, blog)

**Service details page — pure fiction.** `ServiceDetails.tsx:29` renders a hardcoded mock `service` object (name, category, price, description, and 5 features) and reads the route `id` only to build the edit link (`:71`) — `servicesService.getServiceById(id)` is never called even though it already exists and is used by `ServiceForm.tsx`. The displayed shape (features list, single "category", price string) doesn't even match the real `services` schema, so every service opens the same invented record. **Fix:** query the service by `id` on mount via React Query and render the real columns (`title_ar`/`title_en`, `description_ar`/`description_en`, `price_from`, `price_note_ar`, `image_url`, `is_active`). The delete handler (`:39`) additionally only toasts + navigates — wire it to `servicesService.deleteService(id)` (already used correctly by the `Services.tsx` list page).

**Project details page — same pattern.** `ProjectDetails.tsx:39` holds a hardcoded `project` object in `useState` (title/client/status/budget/dates/link/features plus an invented 5-item milestones array), ignoring the route `id` entirely. Many displayed fields (client, budget, startDate, endDate, external link) have no column in the real `projects` schema. On top of that, `:51` renders a **milestone-tracking + completion-percentage + "client approval" workflow** that has no backend at all — there is no milestones table, no approvals infrastructure, and (per CLAUDE.md) no client portal, so "معتمد من العميل" can never be real. **Fix:** load the real project via `projectsService` (as `ProjectForm.tsx` already does), drop the fabricated fields, and either remove the milestone/approval UI or build the backing tables before presenting it. The delete handler (`:60`) must call `projectsService.deleteProject(id)` — right now it only toasts, contradicting the dialog copy that promises permanent DB deletion.

**Blog "Comments" menu item — dead.** `Blog.tsx:151` renders a "التعليقات" dropdown item with no `onClick` alongside working siblings, implying a comments-management feature. No comments service or table exists in `src/services`. **Fix:** either build the comments feature/table or remove the menu item.

---

## Clients & invoices

**Client details page.** `ClientDetails.tsx:30` renders a hardcoded mock client ("ياسين سيف", fixed email/phone/company, `projectsCount 3`, `requestsCount 1`); the route `id` (`:25`) is used only for the edit link. **Fix:** call `clientsService.getClientById(id)`. The delete handler (`:43`) likewise only toasts + navigates — wire it to `clientsService.deleteClient(id)`.

**Invoice details page.** `InvoiceDetails.tsx:20` renders a hardcoded mock invoice (INV-2024-001, fixed client, two fixed line items, static received amount `5000.00` and admin note); `id` is used only for the edit link. **Fix:** call `invoicesService.getInvoiceById(id)` and render the real record. The Print (`:55`), PDF (`:56`), and "Share link with client" (`:117`) buttons have no handlers — wire Print/PDF to the existing `InvoicePDF`/`pdf()` path; note that no share/link table or mechanism exists, so "share with client" needs a backend or should be dropped.

**Invoice line items never persist.** `InvoiceForm.tsx:106` collects multiple named line items (title + price) but `handleSave` builds `invoiceData` with only `customer_name`, `total`, `status`, `customer_phone`, `payment_method` — the per-item breakdown is discarded, the `Invoice` interface has no `items` field, and there is no `invoice_items` table. On edit, the form fabricates a single item from the stored total. This cascades: `Invoices.tsx:66` and the PDF/print dialog hardcode one generic line item priced at `invoice.total`. **Fix:** add an `invoice_items` table (or a JSON `items` column) written and read through `invoicesService.createInvoice`/`updateInvoice`, then feed the PDF/print real items.

**Invoice PDF VAT mismatch.** `InvoicePDF.tsx:221` computes subtotal (= the stored `invoices.total`, since the PDF is fed one synthetic item) then adds a hardcoded 15% VAT → grand total = `total * 1.15`. The form stores `total` as the plain sum with no VAT, and the list/form show that raw `total`. **Fix:** make VAT handling consistent against `invoices.total` — either store VAT explicitly or stop inflating the PDF total.

**Clients list "projects count" column.** `Clients.tsx:65` renders `clients.projects_count`, but nothing writes it: `ClientForm` saves only name/email/phone/company/notes, projects have no `client_id` relationship in `projectsService`, and no aggregation/trigger maintains it. The column is always the DB default or a stale value. **Fix:** derive it from the `projects` table via an aggregate query or a DB trigger (which first requires a project↔client relationship).

**Client "Message"/"Call" quick actions.** `Clients.tsx:95` — both items' `onClick` handlers only call `e.stopPropagation()`. **Fix:** at minimum wire `mailto:client.email` and `tel:client.phone` (no DB record is expected here).

---

## Dashboard & settings

**Dashboard "Active clients" card is a duplicate.** `DashboardHome.tsx:59` labels the 4th card "العملاء النشطون" but its value is `stats?.projects` — identical to card 1. `projectsService.getProjectStats()` only counts `projects` and `requests` and never touches `clients`. **Fix:** add a real client count via `clientsService` and extend `getProjectStats()` to return it.

**Settings page is largely a facade.** The header "حفظ التغييرات" button (`Settings.tsx:72`) only fires `toast.success` and persists nothing, yet it visually owns the whole page. Within it: the Profile card shows hardcoded `defaultValue` literals `admin_yassine` / `admin@rabii.sa` (`:106`) that are never loaded from the authenticated user or saved; the SEO description field (`:153`) is an uncontrolled hardcoded default; the maintenance-mode switch (`:161`) is a bare `<Switch />` with no state and no consumer anywhere; and the two notification switches (`:177`) are uncontrolled with no backing state. Only the separate social-links card is correctly wired to `store_settings`. **Fix:** load real values on mount and persist through the Save button — profile via `profiles` + Supabase auth (`getUser`/`usersService`), and SEO/maintenance/notifications via `store_settings` columns; add actual maintenance-page logic if that toggle is to mean anything.

**Site Content management page.** `SiteContent.tsx:14` keeps hero/subtitle, 4 process steps, partners, and CTA text in a single `useState` literal with no service import. `handleSave` (`:27`) runs `setTimeout(1000)` then a success toast; add-partner (`:170`), remove-partner (`:187`), and every edit only mutate local state. Nothing loads on mount, nothing persists, and the public homepage doesn't read from it. **Fix:** back it with `store_settings` or a dedicated `site_content` table via a service (read on load, write on save) and have the homepage consume it.

---

## Public homepage

**Homepage services grid is frozen in code.** `ServicesSection.tsx:6` renders a hardcoded 7-item const array (the imported `Loader2`/`Zap` icons are unused leftovers of a query that was never written), while its "عرض جميع الخدمات" link points to the DB-backed `/services` page. Services a manager adds/edits/deactivates never appear here, so the homepage can diverge from the page it links to. **Fix:** query `servicesService.getServices(true)` → `services` table, the same source `/services` already uses.

---

## Intentional / local-only (not defects)

These were checked and are acceptable by design (or are marketing copy with no persistence expectation), noted so the reader knows they aren't oversights.

| Feature | Location | Why it's fine |
|---|---|---|
| Blog category dropdown options | `src/pages/admin/BlogForm.tsx:31` | The chosen value **is** persisted to `blog_posts.category` (a free-text column, not an FK to `categories`) and rendered publicly. Only the option list is fixed in code — an input constraint, not faked data. |
| Homepage "شركاء النجاح" partner marquee | `src/components/home/ClientsSection.tsx:3` | Decorative static marquee of company names; no query. Presentational placeholder, not tied to CRM `clients`. |
| Homepage "وش نقدر نسوي لك؟" What-We-Do showcase | `src/components/home/WhatWeDoSection.tsx:5` | Bespoke bilingual marketing showcase of core offering pillars (not CRM service records); static by design. (Minor copy typo at lines 15–16.) |
| About page timeline / "رحلتنا" incl. "50+ projects" claim | `src/pages/public/About.tsx:6` | Fully static marketing page; the "50+" figure is prose inside a 2022 narrative entry, not a rendered counter. Could optionally derive from `projectsService`. |
| Footer Privacy / Terms links | `src/components/Footer.tsx:73` | Hardcoded `#` placeholders; no `/privacy` or `/terms` route exists. Static legal-page placeholders, not a data feature. |

---

## Recommended priorities

1. **Wire the four "details" pages to real records** — `ServiceDetails`, `ProjectDetails`, `ClientDetails`, `InvoiceDetails` all show identical fabricated data for every id. Highest-impact and mechanically similar: fetch by `id` through the existing service (`get*ById`) that each domain's form already uses.
2. **Make the "delete" confirmations actually delete** — service/project/client delete handlers only toast success; the dialogs even promise permanent DB removal. Wire each to its existing `delete*` service call.
3. **Fix the Settings save path** — the main "حفظ التغييرات" button persists nothing while looking like it saves the whole page; load and store Profile (`profiles`/auth), SEO, maintenance, and notification prefs (`store_settings`).
4. **Remove the fake milestones / client-approval UI on the project page** (or build its backing tables) — it presents a live-looking completion percentage and approval workflow that has no backend and no client portal.
5. **Persist invoice line items and reconcile VAT** — line items are dropped on save and the PDF inflates the total by 15% versus the stored/displayed amount, so the customer-facing document disagrees with the record.
6. **Fix the two misleading numbers** — the dashboard "Active clients" card (duplicate of projects count) and the clients list "projects count" column (unmaintained stored value) should come from real `clients`/`projects` queries.
7. **Back the Site Content page and homepage services grid with the DB** — otherwise the homepage silently diverges from the admin-managed `services` and the "manage site content" section is a no-op facade.
8. **Low-effort cleanups** — give the client Message/Call actions `mailto:`/`tel:` links, and either build or remove the blog "Comments" menu item and the notification toggles.