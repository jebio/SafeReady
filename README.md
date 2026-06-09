# SafeReady

A lightweight web app for UK small businesses to track recurring health & safety and compliance checks, log evidence, assign responsibility, and generate inspection packs.

## Tech Stack

- **Runtime:** Bun 1.3+
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** Tailwind CSS v4
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma 6
- **Auth:** Better-Auth (email/password, database sessions, invite-only)
- **Storage:** Supabase Storage (signed URLs)
- **Email:** Resend
- **Validation:** Zod

## Prerequisites

- Bun 1.3+
- A Supabase project (Postgres + Storage)
- A Resend API key

## Setup

```bash
# Install dependencies
bun install

# Copy and fill in environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Push schema to database
bunx prisma db push

# Seed templates and demo data
bun run seed

# Start dev server
bun run dev
```

## Environment Variables

See `.env.example` for all required variables:

| Variable | Description |
|---|---|
| `BETTER_AUTH_SECRET` | Better-Auth secret (generate with `openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Base URL of your app (e.g. `http://localhost:3000`) |
| `DATABASE_URL` | Supabase Postgres connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `RESEND_API_KEY` | Resend API key for transactional emails |

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run seed` | Seed templates and demo data |
| `bunx prisma studio` | Open Prisma Studio (database GUI) |
| `bun run test` | Run tests |

## Auth

Registration is invite-only. The seed script creates a demo workspace with a staff invite:

- **Demo workspace:** Demo Salon
- **Invite token:** `demo-invite-token` (for `staff@demo.safeready.app`)

Visit `/signup?token=demo-invite-token&email=staff@demo.safeready.app` to create a staff account.

## Project Structure

```
src/
├── app/              # Next.js App Router routes
│   ├── (auth)/       # Login, signup pages
│   ├── (app)/        # Authenticated app pages
│   └── api/          # API routes
├── components/       # Shared UI components
├── features/         # Domain modules
│   ├── auth/
│   ├── checklists/
│   ├── team/
│   ├── evidence/
│   ├── templates/
│   ├── workspace/
│   ├── analytics/
│   └── inspection-pack/
└── lib/              # Utilities and shared code
    ├── auth.ts       # Better-Auth server instance
    ├── auth-client.ts
    ├── db.ts         # Prisma client
    ├── supabase-storage.ts
    └── constants.ts
```

## Legal Disclaimer

SafeReady is an organisational tool. It does not provide legal, regulatory, or health & safety advice. Templates are starting points based on public UK guidance. Businesses are responsible for checking whether items apply to their own operations.
