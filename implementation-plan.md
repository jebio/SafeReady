# SafeReady — Initial Scaffold Implementation Plan

## Overview

Build SafeReady: a UK small business safety checklist MVP using Bun + Next.js 16 + TypeScript + shadcn/ui + Prisma + Better-Auth + Supabase Postgres/Storage + Resend. No Stripe for now — demo-first, invite-only registration.

---

## Phase 0: Scaffold

### 0.1 Project Init
- `bun create next-app` with TypeScript, Tailwind, App Router, src directory
- `bun add` all deps (see below)
- `npx shadcn@latest init`

**Dependencies:**
- **Auth:** `better-auth` + `@prisma/client` + `prisma`
- **UI/Layout:** `lucide-react`, `next-themes`, `class-variance-authority`, `clsx`, `tailwind-merge`
- **Forms/Validation:** `zod`, `react-hook-form`, `@hookform/resolvers`
- **Dates:** `date-fns`
- **Email:** `resend`
- **Storage:** `@supabase/supabase-js`

**Files:**
- `package.json` (bun-managed)
- `tsconfig.json`
- `next.config.ts`
- `tailwind.config.ts`
- `vitest.config.ts`
- `.env.example` (template with placeholders)
- `.env.local` (never committed — user fills credentials)

### 0.2 Prisma Schema
- `prisma/schema.prisma` — Better-Auth models (`user`, `session`, `account`, `verification`) + app models
- Run `supabase db pull` to migrate to Supabase Postgres
- Generate Prisma client

**Key models:** User, Session, Account, Verification (Better-Auth), Workspace, WorkspaceMember, Invitation, SystemTemplate, SystemTemplateItem, WorkspaceTemplate, ChecklistTask, TaskOccurrence, EvidenceFile, AuditLog, Notification

### 0.3 Better-Auth Setup
- `src/lib/db.ts` — Prisma client singleton
- `src/lib/auth.ts` — Better-Auth server instance with Prisma adapter + email/password enabled + `nextCookies()` plugin
- `src/lib/auth-client.ts` — Better-Auth browser client (`createAuthClient` from `better-auth/react`)
- `src/app/api/auth/[...all]/route.ts` — Better-Auth route handler via `toNextJsHandler`

### 0.4 Layout Shell
- `src/app/layout.tsx` — Root layout with `<Providers>`
- `src/app/(auth)/layout.tsx` — Centered card wrapper for auth pages
- `src/app/(app)/layout.tsx` — App sidebar + header shell, validates session
- `src/components/ui/*` — shadcn-init components
- `src/components/app-sidebar.tsx` — Navigation sidebar
- `src/components/app-header.tsx` — Top bar with user menu
- `src/components/providers.tsx` — Theme provider, session context wrapper

### 0.5 Auth Pages
- `src/app/(auth)/login/page.tsx` — Email/password login form
- `src/app/(auth)/signup/page.tsx` — Sign-up form with invite token validation
- `src/features/auth/login-form.tsx` — React Hook Form + Zod + Better-Auth `signInEmail`
- `src/features/auth/signup-form.tsx` — Validates invite token, calls Better-Auth signup, creates WorkspaceMember

### 0.6 Seed Scripts
- `prisma/seed.ts` — Entry point calling template seeds + demo data
- `seed/templates/office.ts`, `salon.ts`, `workshop.ts`, `retail.ts` (6-8 items each)
- `seed/demo-data.ts` — Demo workspace with sample completions

---

## Phase 1: Core Checklist Flow

### 1.1 Dashboard
- `src/app/(app)/dashboard/page.tsx`
- `src/features/checklists/dashboard-stats.tsx` — Due/overdue/completed counts, compliance score widget
- `src/features/checklists/task-card.tsx` — Status badge, title, assignee, due date
- `src/features/checklists/task-list.tsx` — Filterable/sortable task list
- `src/features/analytics/compliance-score.tsx` — % on-time completions

### 1.2 Task Completion Flow
- Route protection via Better-Auth cookie check
- `src/app/(app)/checklists/page.tsx` — Full task list with filters
- `src/app/(app)/checklists/[id]/page.tsx` — Task detail + complete form
- `src/features/checklists/complete-task-form.tsx` — Notes, completed-by, evidence upload
- `src/features/checklists/recurrence-utils.ts` — `computeNextDueDate()` pure function

### 1.3 Recurrence Logic
Complete action: mark occurrence completed → compute next due → create next occurrence → audit log

### 1.4 Evidence Uploads
- `src/features/evidence/file-upload.tsx`
- `src/app/api/evidence/upload/route.ts` — Validates + returns signed upload URL
- `src/lib/supabase-storage.ts`
- `src/features/evidence/file-viewer.tsx`

---

## Phase 2: Templates & Onboarding

### 2.1 Template Seed Data
4 sector templates with 6-8 items each, including source attributions

### 2.2 Onboarding Flow
Multi-step: workspace details → template selection → done

---

## Phase 3: Team & Invitations

### 3.1 Invite Flow
Owner invites via email → Invitation record + Resend email → Staff signs up via invite link → WorkspaceMember created

### 3.2 Team Management
Member list with roles, remove button (owner only)

---

## Phase 4: History & Oversight

### 4.1 History Page
Filterable completed task list by date range

### 4.2 Inspection Pack
Server-side PDF generated via `@react-pdf/renderer` (React component → `pdf().toBlob()` → API route serves attachment). Summary, completed items, evidence links, legal disclaimer. **Do not use browser print-to-PDF** — it produces inconsistent results. The `/api/inspection-pack/generate` endpoint returns the PDF as a downloadable attachment.

### 4.3 Analytics Page
Compliance score, trend, most-missed categories

### 4.4 Notifications
In-app notification bell + audit log display

---

## Key Architectural Decisions

| Decision | Choice |
|---|---|
| **Auth** | Better-Auth + Prisma adapter. Invite-only signup via custom wrapper. |
| **DB** | Supabase Postgres via Prisma. All tables in same schema. |
| **Storage** | Supabase Storage with signed URLs. Bucket: `evidence-files`. |
| **Email** | Resend for invite emails + password reset. |
| **Billing** | Not in scope. `trial_ends_at` field for future use. |
| **PDF** | Print stylesheet + browser print-to-PDF. |
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
7. **QA:** `bun vitest run` passes, smoke test all user stories
