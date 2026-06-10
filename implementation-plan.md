# SafeReady — Implementation Plan

## Overview

Build SafeReady: a UK small business safety checklist MVP using Bun + Next.js 16 + TypeScript + shadcn/ui + Prisma + Better-Auth + Supabase Postgres/Storage + Resend. No Stripe for now — demo-first, invite-only registration.

---

> **Status:** Phases 0–4 (core scaffold, checklist flow, templates/onboarding, team/invitations, history/oversight) are **COMPLETE**.  
> Phases 5–8 below represent the gaps identified when comparing the current codebase against `project-scope.md`.

---

## Phase 0: Scaffold ✅ COMPLETE

### 0.1 Project Init
- `bun create next-app` with TypeScript, Tailwind, App Router, src directory
- `bun add` all deps
- `npx shadcn@latest init`

**Dependencies installed:**
- **Auth:** `better-auth` + `@prisma/client` + `prisma`
- **UI/Layout:** `lucide-react`, `next-themes`, `class-variance-authority`, `clsx`, `tailwind-merge`
- **Forms/Validation:** `zod`, `react-hook-form`, `@hookform/resolvers`
- **Dates:** `date-fns`
- **Email:** `resend`
- **Storage:** `@supabase/supabase-js`
- **PDF:** `@react-pdf/renderer`
- **Testing:** `vitest`, `@testing-library/react`, `playwright`

### 0.2 Prisma Schema
- `prisma/schema.prisma` — Better-Auth models + app models (14 models total)
- Supabase Postgres via Prisma

### 0.3 Better-Auth Setup
- `src/lib/db.ts` — Prisma client singleton
- `src/lib/auth.ts` — Better-Auth server instance with Prisma adapter + email/password + `nextCookies()`
- `src/lib/auth-client.ts` — Better-Auth browser client
- `src/app/api/auth/[...all]/route.ts` — Better-Auth route handler

### 0.4 Layout Shell
- Root layout, auth layout (centered card), app layout (sidebar + header + session guard)
- shadcn/ui components: Badge, Button, Card, Dialog, Input, Label, Progress, Select, Textarea

### 0.5 Auth Pages
- Login page + form
- Invite-based signup page + form (validates token, creates account, accepts invitation)

### 0.6 Seed Scripts
- `prisma/seed.ts` — Entry point
- 4 system templates: office (8 items), salon (7 items), workshop (8 items), retail (8 items)
- Demo workspace "Demo Salon" with 2 accounts (owner + staff)

---

## Phase 1: Core Checklist Flow ✅ COMPLETE

### 1.1 Dashboard
- Stats cards (due/overdue/completed/compliance%)
- Task list with URL-based filters (status, frequency, category)
- Task cards with status badge, title, due date, frequency, category

### 1.2 Task Completion Flow
- Task detail page with completion form (notes + evidence upload)
- `useActionState` form calling `completeTask` server action

### 1.3 Recurrence Logic
- `computeNextDueDate()` — daily/weekly/monthly/quarterly/yearly
- On complete: mark done → compute next due → create next occurrence → audit log

### 1.4 Evidence Uploads
- Signed URL upload to Supabase Storage (bucket: `evidence-files`)
- Upload/download/delete API routes
- Evidence section with file list

---

## Phase 2: Templates & Onboarding ✅ COMPLETE

### 2.1 Template Seed Data
4 sector templates with source attributions (HSE/ICO references)

### 2.2 Onboarding Flow
3-step wizard: workspace details → template picker → confirm

---

## Phase 3: Team & Invitations ✅ COMPLETE

### 3.1 Invite Flow
Owner invites via email → Invitation record + Resend email → auto-links existing users → Staff signs up via invite link

### 3.2 Team Management
Member list with roles, remove owner-only, pending invites with cancel

---

## Phase 4: History & Oversight ✅ COMPLETE

### 4.1 History Page
Date range + category + member filters, card list of completed items

### 4.2 Inspection Pack
Server-side PDF via `@react-pdf/renderer` — A4 layout with business details, compliance summary, checklists, disclaimer

### 4.3 Analytics Page
Compliance score, monthly trend (progress bars), missed categories, team breakdown

### 4.4 Notifications
In-app notification bell with unread count, mark-read, mark-all-read

### 4.5 Audit Log
Action list with icons in settings page

---

## Phase 5: Custom Checklist Builder ✅ COMPLETE

**Why:** The onboarding wizard says "customise tasks later" but there's no UI to create, edit, or delete checklist tasks after onboarding. This is core product value (project-scope.md §6.5).

### 5.1 Task Management Page
- `src/app/(app)/checklists/manage/page.tsx` — List of all active tasks for the workspace
- `src/features/checklists/task-manager.tsx` — Client component: table/card list with edit/delete actions
- Server action: `getManageableTasks()` — returns all tasks with metadata (occurrence count, last completed)
- Server action: `deleteChecklistTask(taskId)` — soft-deletes (sets `active = false`), cancels due occurrences, audit log

### 5.2 Create Task Dialog
- `src/features/checklists/create-task-dialog.tsx` — Dialog form fields:
  - title (required)
  - description (optional)
  - category (optional free-text or select from existing)
  - frequency (select: daily/weekly/monthly/quarterly/yearly)
  - evidence_required (toggle)
  - notes_hint (optional)
  - assignee (optional: select from workspace members)
- Server action: `createCustomTask(formData)` — validates, creates ChecklistTask, creates first due TaskOccurrence, audit log

### 5.3 Edit Task Dialog
- `src/features/checklists/edit-task-dialog.tsx` — Pre-filled form, same fields as create
- Server action: `updateTask(taskId, formData)` — updates task fields, does NOT reset recurrence schedule

### 5.4 Wire into Navigation
- Add "Manage Tasks" link to sidebar or checklists page header
- Add "Create Task" button to checklists page (when no current filter shows a task list)

### Files to create:
- `src/app/(app)/checklists/manage/page.tsx`
- `src/features/checklists/task-manager.tsx`
- `src/features/checklists/create-task-dialog.tsx`
- `src/features/checklists/edit-task-dialog.tsx`
- Server actions: `createCustomTask`, `updateTask`, `deleteChecklistTask`, `getManageableTasks`

---

## Phase 6: Task Assignment UI 🔴 NOT BUILT

**Why:** `assignedUserId` exists in schema, types, queries — but is never surfaced in the UI. Staff can't see "my tasks" and owners can't assign (project-scope.md §6.8).

### 6.1 Assignee on Task Detail
- Show assignee name on task detail page (if set)
- Show assignee on task cards in dashboard/checklists list

### 6.2 Assignment in Complete Form
- Add assignee dropdown to `CompleteTaskForm` (owner can assign at completion time)
- Server action: `assignTask(taskId, memberId)` — updates `assignedUserId`

### 6.3 Filter by Assignee
- Add "My Tasks" filter or tab on checklists page
- Add assignee filter to task list query

### Files to modify:
- `src/features/checklists/task-card.tsx` — show assignee name
- `src/features/checklists/task-filters.tsx` — add assignee filter
- `src/app/(app)/checklists/[taskId]/page.tsx` — show assignee
- `src/actions/checklists.ts` — add `assignTask`, update `getTasks` to filter by assignee

---

## Phase 7: Password Reset 🔴 NOT BUILT

**Why:** Required for any production SaaS. Better-Auth supports it natively — just need to wire up the pages (project-scope.md §6.1).

### 7.1 Forgot Password Page
- `src/app/(auth)/forgot-password/page.tsx` — Email input form
- `src/features/auth/forgot-password-form.tsx` — Calls `authClient.forgetPassword(email)`
- Better-Auth config: add `forgotPassword` email hook → Resend send email

### 7.2 Reset Password Page
- `src/app/(auth)/reset-password/page.tsx` — New password form (token from query param)
- `src/features/auth/reset-password-form.tsx` — Calls `authClient.resetPassword({ newPassword, token })`
- Link from forgot-password → reset-password

### 7.3 Email Template
- `src/lib/email-templates/reset-password.tsx` — React Email template or plain HTML
- Wire into `auth.emailTemplate` in Better-Auth config

### Files to create:
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/features/auth/forgot-password-form.tsx`
- `src/features/auth/reset-password-form.tsx`
- `src/lib/email-templates/reset-password.ts`

### Files to modify:
- `src/lib/auth.ts` — add forgot password config + email template

---

## Phase 8: Production Polish 🟡 NOT BUILT

### 8.1 loading.tsx + error.tsx
- Add `loading.tsx` to each route group: `(app)`, `(auth)`
- Add `error.tsx` with retry button to `(app)` routes
- Simple skeleton/spinner for loading states

### 8.2 Workspace Settings Edit
- Settings page is currently read-only display
- Add edit form: business name, sector, address, phone, contact info
- Server action: `updateWorkspaceSettings(formData)`

### 8.3 Evidence Inline Viewer
- `src/features/evidence/file-viewer.tsx` — Image preview (lightbox) + PDF iframe
- Show thumbnail/small preview in evidence list

### 8.4 Pagination
- History page: add "Load More" or page controls
- Notifications bell: add "Load More"
- Server actions: add `skip`/`take` params to `getHistory`, `getNotifications`

### 8.5 Trial End Check
- Add check in app layout: if `trialEndsAt < now` and no active subscription, show banner + block some features
- Or: defer to when Stripe is integrated (planned as post-MVP)

### Files to create:
- `src/app/(app)/loading.tsx`
- `src/app/(app)/error.tsx`
- `src/app/(auth)/loading.tsx`

### Files to modify:
- `src/features/settings/settings-client.tsx` — add edit form
- `src/features/evidence/evidence-list.tsx` — add inline viewer
- `src/actions/settings.ts` — add `updateWorkspaceSettings`

---

## Phase 9: Testing Coverage 🟡 PARTIALLY BUILT

### 9.1 Component Test Assertions
- 5 component test shells exist with placeholder `expect(true).toBe(true)`
- Fill in actual assertions for: analytics-client, history-client, inspection-pack-view, notification-bell, settings-client

### 9.2 Missing Component Tests
- Onboarding wizard component
- Team management components
- Evidence components (file-upload, evidence-list, evidence-section)
- Checklist components (task-list, task-card, task-filters, complete-task-form)
- Auth forms (login-form, signup-form)

### 9.3 API Route Tests
- Only inspection-pack/generate has tests
- Add: evidence upload/download/delete

### 9.4 E2E Authenticated Flows
- Login → dashboard sees stats
- Complete a task → verify occurrence created
- View history → verify completed items shown
- Generate inspection pack → verify PDF downloads

### 9.5 New Feature Tests
- Phase 5: custom checklist builder (create, edit, delete tasks)
- Phase 6: task assignment (assign, filter by assignee)
- Phase 7: password reset flow

---

## Summary: Build Priority Order

| Priority | Phase | Effort | Value |
|----------|-------|--------|-------|
| 🔴 P0 | Phase 5: Custom Checklist Builder | 2–3 days | Highest — unlocks core product promise |
| 🔴 P0 | Phase 6: Task Assignment UI | 1 day | High — enables staff-owner collaboration |
| 🔴 P0 | Phase 7: Password Reset | 0.5 day | Required for production |
| 🟡 P1 | Phase 8.3: Evidence Viewer | 0.5 day | Medium — better UX |
| 🟡 P1 | Phase 8.1: loading/error states | 0.5 day | Medium — polish |
| 🟡 P1 | Phase 8.2: Settings Edit | 0.5 day | Medium — parity with scope |
| 🟢 P2 | Phase 8.4: Pagination | 0.5 day | Low — acceptable at MVP scale |
| 🟢 P2 | Phase 9: Test Coverage | 2 days | Medium — confidence for paying customers |
| 🟢 P2 | Dark mode, responsive fixes | 1 day | Low — nice-to-have |

---

## Future Plans (not MVP)

- **Email Reminders & Digest** — Daily cron job sending overdue/upcoming digests via Resend
- **Stripe billing integration** — Subscription checkout, customer portal, trial enforcement
- **More sector templates** — Hospitality, childcare, care services

---

## Key Architectural Decisions

| Decision | Choice |
|---|---|
| **Auth** | Better-Auth + Prisma adapter. Invite-only signup via custom wrapper. |
| **DB** | Supabase Postgres via Prisma. All tables in same schema. |
| **Storage** | Supabase Storage with signed URLs. Bucket: `evidence-files`. |
| **Email** | Resend for invite emails + password reset. |
| **Billing** | Future. `trial_ends_at` field present for later use. |
| **PDF** | `@react-pdf/renderer` — server-side, React components, `pdf().toBlob()` via API route. |
| **Recurrence** | Simple date math. Next due = completedAt + frequency offset. |
| **Demo** | Seed creates demo workspace with sample data. |

---

## Verification

1. **Scaffold:** `bun dev` starts, `/api/auth` responds
2. **Auth:** First user via seed, login/logout works, protected routes redirect
3. **Templates:** `bun run seed` populates templates, onboarding creates workspace
4. **Checklists:** Dashboard shows due tasks, completion creates next occurrence
5. **Team:** Invite flow works end-to-end, workspace scoping correct
6. **Oversight:** History, inspection pack, compliance score all function
7. **Custom Builder:** Owner can create/edit/delete tasks after onboarding
8. **Assignment:** Owner can assign tasks, staff can filter by "My Tasks"
9. **Password Reset:** Forgot password → email → reset flow works
10. **QA:** `bun vitest run` passes, smoke test all user stories
