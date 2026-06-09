# Project Scope: UK Small Business Safety Checklist & Evidence Log

## 1. Project Overview

Build a lightweight multi-tenant web application for UK small businesses that helps them stay inspection-ready by managing recurring health & safety and compliance checklists, logging evidence, generating inspection packs, and coordinating staff completion of recurring operational checks.

This is a focused micro-SaaS MVP intended to be built in **up to 1 month** using Coding Agent. The goal is not to provide legal advice. The goal is to help businesses organize tasks, maintain records, assign responsibility, and show evidence of completed checks based on publicly available UK guidance.

Primary target customers for MVP:
- Small offices
- Salons / beauty businesses
- Small clinics / therapy practices
- Trades / workshops / small facilities
- Small retail and hospitality businesses if template coverage is added in time

Core customer problem:
- Compliance and recurring safety tasks are often tracked in paper folders, spreadsheets, or WhatsApp messages.
- Business owners forget recurring checks or cannot tell who completed them.
- When asked by a landlord, insurer, auditor, or inspector, they struggle to prove what was done and when.
- Small teams need a simple shared system, not an enterprise compliance platform.

Core value proposition:
- Ready-made checklist templates
- Recurring reminders and due dates
- Evidence uploads per check
- Multi-user completion tracking
- One-click exportable inspection pack
- A simple compliance health score and audit trail

Working product name:
- SafeReady
- Alternative names: CheckProof, InspectFile, ReadyLog

---

## 2. MVP Goal

Ship a solid production-grade SaaS MVP that allows a small business to:
1. Sign up and create a workspace
2. Select one or more checklist templates
3. Invite staff members
4. See due / overdue checklist items
5. Mark items as complete
6. Add notes and upload evidence files/photos
7. Generate a printable/downloadable inspection pack
8. Receive reminders for overdue and upcoming items
9. Pay for the product via Stripe after a free trial
10. Review a simple compliance health score and audit trail

Out of scope for MVP:
- Advanced legal advisory engine
- Full enterprise compliance workflows
- Native mobile app
- Deep sector-specific legal automation
- Full HR, payroll, tax, or accounting compliance suite
- AI-generated legal/compliance decisions
- Consultant or multi-client portal in v1 unless time remains after core completion

---

## 3. Product Vision

The product should feel like a simple combination of:
- checklist app
- recurring task manager
- evidence log
- inspection binder / PDF exporter
- lightweight team accountability system

The experience must be simple enough that a non-technical small business owner can understand it in under 5 minutes, while still being trustworthy enough to justify a monthly subscription.

Positioning statement:
A simple web app for UK small businesses to track recurring safety and compliance checks, assign responsibility, store proof, and stay inspection-ready.

---

## 4. User Types

### Primary User
Business owner / manager of a small UK business.

### Secondary User
Staff member responsible for completing checks.

### Optional Future User
External compliance consultant or auditor.

For MVP, support these roles:
- Owner
- Staff

Owner permissions:
- manage business settings
- choose templates
- invite/remove staff
- view all tasks, reports, and billing
- generate export packs

Staff permissions:
- view assigned and workspace tasks
- complete tasks
- upload evidence
- add notes

---

## 5. User Stories

### Account / Workspace
- As a business owner, I want to create an account so I can use the system.
- As a business owner, I want to create a workspace with my business name and sector.
- As a business owner, I want to start with a trial before paying.

### Templates
- As a business owner, I want to choose a checklist template relevant to my business so I can get started quickly.
- As a business owner, I want default recurring tasks so I do not need to write everything from scratch.
- As a business owner, I want to add custom checklist items so the app fits my business.

### Checklist Operations
- As a user, I want to view all checks due today / this week so I know what needs doing.
- As a user, I want to mark a task complete so there is a record.
- As a user, I want to add notes when completing a task.
- As a user, I want to upload evidence like a photo or PDF.
- As a user, I want recurring tasks to automatically create the next due occurrence.
- As a user, I want to see which tasks are assigned to me.

### Team Operations
- As a business owner, I want to invite staff so different people can complete checks.
- As a business owner, I want to see who completed what and when.

### Oversight
- As a business owner, I want to see overdue items so I can chase them.
- As a business owner, I want a history log of completed tasks.
- As a business owner, I want a simple compliance score so I can quickly understand overall status.
- As a business owner, I want notifications and reminders so nothing gets missed.

### Inspection Pack
- As a business owner, I want to generate an inspection pack that shows completed checks and evidence references.
- As a business owner, I want to print or download this pack as PDF.
- As a business owner, I want this report filtered by date range.

### Billing
- As a business owner, I want to subscribe after a trial so I can continue using the product.
- As a business owner, I want to manage billing from a secure portal.

---

## 6. MVP Features

### 6.1 Authentication
Must have:
- Email/password sign up
- Login/logout
- Password reset if available quickly via auth provider
- Protected app routes

Recommendation:
Use Supabase Auth or Clerk. Prefer Supabase Auth for speed and lower complexity.

### 6.2 Workspace Setup
Fields:
- business_name
- sector
- business_address (optional in MVP)
- contact_name
- contact_email
- phone (optional)
- logo_url (optional)

### 6.3 Trial & Billing
Must have:
- Free trial support
- Stripe Checkout for plan subscription
- Stripe customer portal link for billing management
- Billing state reflected in app access rules

Keep pricing simple in MVP:
- One trial
- One paid monthly plan initially

### 6.4 Checklist Templates
Provide at least 4 to 6 starter templates:
- Small Office
- Salon / Clinic
- Workshop / Trades
- Retail
- Optional if time allows: Food / Hospitality, Childcare / Care services

Each template contains checklist definitions with:
- title
- description
- category
- frequency (daily, weekly, monthly, quarterly, annual)
- evidence_required (boolean)
- notes_hint
- source_label
- source_url
- default_assignee_role optional

Important:
Every template item must include a `source_label` and `source_url` referencing the public guidance used to inspire it, such as HSE or ICO pages. The app should clearly state that templates are guidance-led starting points and must be adapted by the business.

### 6.5 Custom Checklist Builder
Owners can create their own checklist tasks with:
- title
- description
- category
- frequency
- evidence_required
- assignee optional
- notes_hint

This is a high-priority feature because it increases product value beyond a static checklist library.

### 6.6 Dashboard
Main dashboard widgets:
- Due today count
- Overdue count
- Completed this week count
- Upcoming checks list
- Recently completed checks list
- Compliance health score
- Team activity feed

### 6.7 Checklist Item Completion
For each due item user can:
- Mark complete
- Add completion date/time (default now)
- Add completed_by name
- Add notes
- Upload one or more evidence files

Supported evidence examples:
- JPG / PNG photos
- PDF documents

### 6.8 Assignments & Team Collaboration
Must have:
- Owner can invite staff by email
- Workspace members page
- Optional task assignment to a user
- Track who completed each occurrence

### 6.9 Recurrence Engine
Simple recurrence logic only:
- After completion, create the next occurrence using the checklist frequency
- If overdue items are completed late, next due date should be based on completion date for MVP simplicity

Supported frequencies:
- daily
- weekly
- monthly
- quarterly
- yearly

Do not over-engineer recurrence rules in v1.

### 6.10 Evidence Storage
Need file upload and retrieval.

Recommendation:
- Supabase Storage or S3-compatible storage

File metadata must store:
- original filename
- content type
- size
- uploaded_by
- uploaded_at
- linked checklist completion id

### 6.11 Inspection Pack
Generate a printable report page and downloadable PDF that includes:
- business details
- business logo if available
- template(s) in use
- report generated at timestamp
- selected date range
- summary counts: due, overdue, completed
- compliance health score summary
- completed task history within chosen date range
- notes
- evidence file references / thumbnails / links where appropriate
- audit-style list of who completed each item
- source note stating templates are based on public UK guidance and must be reviewed by the business

For MVP, build both:
- clean HTML print view
- downloadable PDF export

### 6.12 Notifications
Must have at least one of these:
- Daily email digest for overdue items
- Reminder email for items due soon

Optional:
- In-app notification feed / bell

### 6.13 Audit Log
Visible owner-facing activity log showing:
- user invited
- task completed
- evidence uploaded
- template enabled
- custom task created
- billing status changed if easy to capture

### 6.14 Compliance Health Score
Create a simple score that gives the owner one clear indicator.

Suggested MVP formula:
- percentage based on occurrences completed on time over the selected recent period
- penalize overdue items
- show score plus explanation text

Keep this simple and transparent.

### 6.15 Analytics Page
Basic analytics page for owner:
- on-time vs overdue counts
- completions over last 30/90 days
- most missed categories
- task volume by category

Keep charts lightweight and easy to understand.

---

## 7. Non-Functional Requirements

- Fast to build and deploy
- Simple and clean UI
- Mobile-responsive enough for phone browser use
- Secure file uploads
- Multi-tenant data isolation
- Clear audit trail on task completion
- Easy to seed demo data
- Stable enough for paying customers
- Good error handling and empty states
- Reasonable observability for production debugging

Performance expectations for MVP:
- < 2 seconds for dashboard load under small dataset
- handle at least 5,000 checklist completions per workspace without issues
- support multiple concurrent small-business tenants

Reliability expectations:
- failed uploads must show clear retry message
- reminder jobs should be idempotent where practical
- billing webhook events must be processed safely

---

## 8. Recommended Tech Stack

Because this must be built quickly in Coding Agent while still feeling production-grade, optimize for speed, reliability, and low operational complexity.

### Preferred Stack
- Runtime: Bun (package manager + runtime, not npm/pnpm/yarn)
- Frontend + backend: Next.js 16 with App Router
- Language: TypeScript
- UI: Tailwind CSS + shadcn/ui
- Database: PostgreSQL via Supabase
- Auth: Supabase Auth
- File storage: Supabase Storage
- ORM: Prisma
- Validation: Zod
- Forms: React Hook Form
- Date handling: date-fns
- PDF generation: server-generated PDF if feasible
- Email: Resend
- Billing: Stripe
- Background jobs: Vercel Cron or Supabase scheduled functions for reminders
- Error monitoring: Sentry if time allows
- Hosting: Vercel

### Why this stack
- Fast scaffolding
- Good Coding Agent support
- Minimal backend ops
- Easy auth + storage + DB in one place
- Stripe and Resend are straightforward to integrate
- Production-friendly enough for real pilot customers

---

## 9. High-Level Architecture

### App Areas
1. Marketing / landing page
2. Auth pages
3. Trial / billing flow
4. App dashboard
5. Template management
6. Custom checklist builder
7. Checklist execution and history
8. Team management
9. Analytics page
10. Inspection pack export page
11. Settings and billing portal

### Architecture Style
- Single Next.js full-stack app
- Server actions or route handlers for mutations
- Postgres database
- Supabase Storage for evidence files
- Scheduled reminder jobs
- Stripe webhooks for billing state sync

### Multi-Tenancy
Use workspace_id on all tenant-owned records.
Every query must be scoped by authenticated user's workspace_id.

---

## 10. Data Model

Design the schema simply. Suggested entities:

### users
- id
- email
- full_name
- created_at

### workspaces
- id
- name
- sector
- address
- contact_name
- contact_email
- phone
- logo_url
- billing_status
- trial_ends_at
- created_at

### workspace_members
- id
- workspace_id
- user_id
- role (owner, staff)
- invited_email optional
- invited_at
- joined_at
- created_at

### subscription_records
- id
- workspace_id
- stripe_customer_id
- stripe_subscription_id
- plan_name
- status
- current_period_end
- created_at
- updated_at

### templates
- id
- name
- slug
- sector
- is_system_template
- created_at

### template_items
- id
- template_id
- title
- description
- category
- frequency
- evidence_required
- notes_hint
- source_label
- source_url
- default_assignee_role
- sort_order

### workspace_templates
- id
- workspace_id
- template_id
- enabled_at

### checklist_tasks
Represents active recurring tasks derived from template items or created manually.
- id
- workspace_id
- template_item_id nullable
- title_snapshot
- description_snapshot
- category
- frequency
- evidence_required
- source_label nullable
- source_url nullable
- assigned_user_id nullable
- active
- created_by_user_id
- created_at

### task_occurrences
Represents each due instance.
- id
- workspace_id
- checklist_task_id
- due_date
- status (due, overdue, completed)
- completed_at
- completed_by_user_id nullable
- completed_by_name nullable
- notes nullable
- created_at

### evidence_files
- id
- workspace_id
- task_occurrence_id
- storage_path
- original_filename
- content_type
- file_size
- uploaded_by_user_id
- uploaded_at

### audit_logs
- id
- workspace_id
- actor_user_id nullable
- action_type
- entity_type
- entity_id
- metadata_json
- created_at

### notifications
- id
- workspace_id
- user_id nullable
- type
- title
- body
- read_at nullable
- created_at

Notes:
- Snapshot source/title fields into checklist_tasks so template edits later do not break historical consistency.
- Snapshotting occurrences is optional if time is tight.
- Keep analytics computed from existing data rather than overbuilding a separate warehouse.

---

## 11. Main Screens

### 11.1 Landing Page
Sections:
- headline
- problem/solution
- features
- pricing teaser
- CTA to start trial

### 11.2 Sign Up / Login
Basic auth pages.

### 11.3 Onboarding
- Create workspace
- Choose sector
- Select starter template(s)
- Seed starter tasks
- Introduce trial and next steps

### 11.4 Dashboard
- KPIs
- due today list
- overdue list
- recent completions
- compliance score
- team activity

### 11.5 Checklist Tasks Page
- list/filter by status/category/frequency/assignee
- view upcoming and overdue tasks

### 11.6 Complete Task Modal / Page
- notes field
- completed by field
- upload evidence
- submit completion

### 11.7 History Page
- filter by date range
- inspect completed records
- open evidence files

### 11.8 Analytics Page
- trend cards and simple charts

### 11.9 Team Page
- invite users
- list members
- show roles

### 11.10 Inspection Pack Page
- printable summary view
- date filters
- export/download action

### 11.11 Settings Page
- business info
- workspace basics
- notification preferences
- billing portal

---

## 12. UX Principles

- Very low cognitive load
- Avoid enterprise-style complexity
- Keep actions obvious: Complete, Upload Proof, Export Pack, Invite Staff
- Use simple status badges: Due, Overdue, Completed
- Show confidence-building source labels for templates
- Add legal disclaimer where needed
- Make the product look trustworthy enough to justify payment

Sample microcopy:
- “Based on public UK guidance. Please review for your business.”
- “This tool helps you track checks and evidence. It is not legal advice.”
- “Stay ready for inspections, insurers, and audits.”

---

## 13. Legal / Compliance Disclaimers

Add visible disclaimers in onboarding, template pages, and export page.

Required disclaimer concept:
- This product is an organizational tool only.
- It does not provide legal, regulatory, or health & safety advice.
- Templates are starting points based on public guidance.
- Businesses are responsible for checking whether items apply to their own operations.

Do not present the app as certifying legal compliance.

---

## 14. Template Seed Content Strategy

For MVP, manually seed a small number of high-value checklist items per template.

Example categories:
- Fire safety
- Slips/trips housekeeping
- First aid / incident readiness
- Equipment visual checks
- Staff area cleanliness
- Record review
- Risk assessment review
- Opening/closing checks where relevant

Seed around:
- 12 to 20 items per template

Do not try to encode all UK regulations. Start with practical recurring checks.

Each item should include:
- human-friendly title
- simple explanation in plain English
- suggested frequency
- whether evidence is recommended
- public source attribution

---

## 15. Suggested Delivery Plan (1 Month)

### Week 1: Core Foundations
- Create Next.js app
- Set up Supabase project
- Configure auth
- Set up Tailwind/shadcn
- Create database schema
- Build onboarding flow
- Seed initial templates
- Create dashboard shell

### Week 2: Core Product Completion
- Implement checklist tasks and occurrences
- Build complete-task flow
- Add recurrence creation logic
- Implement evidence uploads
- Build history page
- Add audit logs
- Build print-friendly inspection pack page

### Week 3: Paid Product Features
- Integrate Stripe Checkout and billing portal
- Add trial logic
- Add staff invitations and roles
- Add task assignment
- Build custom checklist builder
- Add email reminders/digest

### Week 4: Production Polish
- Add analytics page
- Add compliance health score
- Build downloadable PDF export
- Improve onboarding and settings UX
- Add better error states and validation
- Add demo workspace data
- QA, bug fixes, deployment, and launch prep

Optional stretch goals after core completion:
- in-app notifications
- more sector templates
- Sentry integration
- branded landing page polish

---

## 16. Acceptance Criteria

The MVP is successful if:
- A new user can sign up and create a workspace
- A user can start a free trial
- A user can select template(s) and get seeded recurring checklist tasks
- The dashboard shows due and overdue tasks correctly
- A user can complete a task and upload at least one evidence file
- Completing a task creates the next due occurrence
- An owner can invite a staff member
- A workspace can create at least one custom checklist task
- Reminder emails can be sent for overdue or upcoming items
- A user can view historical completions
- A user can generate a printable and downloadable inspection pack
- Billing state can be managed through Stripe
- Data is correctly isolated per workspace
- The app is deployed and usable in production for paying customers

---

## 17. Future Roadmap

Do not build these in MVP unless trivial.

### Phase 2
- More sector-specific template packs
- In-app notification center
- Better role permissions
- Multi-location support
- Public share link for inspection pack
- Customer support/help center

### Phase 3
- AI assistant to explain checklist items in plain English
- AI import of business-specific checklists
- OCR from uploaded files
- Compliance calendar
- Consultant dashboard managing multiple client businesses
- White-label / partner mode

---

## 18. Build Instructions for Coding Agent

Please generate this as a production-ready but lean MVP.

Implementation priorities:
1. Finish end-to-end core flows before adding polish
2. Favor simple code over abstraction-heavy architecture
3. Use server-side validation everywhere
4. Use clear folder structure and reusable UI components
5. Seed the database with starter templates and demo data
6. Include a README with local setup and deploy instructions
7. Keep billing and reminders simple but real
8. Optimize for shipping a paid pilot-ready app, not theoretical perfection

Please scaffold:
- full Next.js app structure
- database schema and migrations
- Supabase integration
- auth flow
- trial and billing flow
- dashboard pages
- checklist completion flow
- evidence upload flow
- team invitations
- custom checklist builder
- analytics page
- inspection pack page with PDF/export support
- seed scripts for templates

Also include:
- sample env file
- clean UI theme
- responsive layout
- route protection
- empty/loading/error states
- webhook handling for Stripe
- scheduled job mechanism for reminder emails

Testing expectations:
- Add at least basic tests for recurrence logic, billing access control, and auth-protected routes
- Add smoke-test instructions for manual QA

---

## 19. Suggested Initial Template Seeds

### Small Office
- Check walkways and exits are clear
- Check first aid box is stocked
- Check fire extinguisher access is unobstructed
- Review accident book presence
- Check workstation area is tidy and cables are safe
- Monthly review of risk assessment

### Salon / Clinic
- Check floors are dry and safe
- Check treatment areas are clean
- Check sharps / waste disposal process is followed if relevant
- Check first aid supplies
- Check electrical equipment visual condition
- Monthly review of cleaning and incident log

### Workshop / Trades
- Check access routes are clear
- Check portable tools for visible damage
- Check PPE availability
- Check hazardous items storage
- Check first aid kit
- Monthly review of incidents / near misses

### Retail
- Check customer walkways are free from trip hazards
- Check stockroom access is clear
- Check spill response materials are available
- Check first aid supplies
- Check visible electrical hazards are absent
- Weekly review of incidents and hazards

### Optional Hospitality
- Check opening cleanliness tasks completed
- Check kitchen / prep area hazards are reviewed
- Check slips/trips risks are controlled
- Check first aid supplies
- Check fire exits remain clear
- Weekly review of incidents

These are examples only and must be reviewed against actual public guidance sources during seed creation.

---

## 20. Commercial Goal

The MVP should be sellable to first pilot customers with a simple pitch:

“SafeReady helps small UK businesses stay inspection-ready with recurring safety checklists, proof uploads, reminders, staff accountability, and one-click inspection packs.”

The product should be good enough to demo to 20 to 50 local businesses immediately after launch, convert early trial users into paying customers, and validate a repeatable monthly subscription model.
