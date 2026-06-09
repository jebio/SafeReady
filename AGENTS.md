# Memory

## Project Documents
- `project-scope.md` — Full product spec, user stories, features, architecture, and data model.
- `tech-stack.md` — Detailed tech stack description and rationale for every dependency.
- `implementation-plan.md` — Phased build plan with tasks, dependencies, and risks.
- `API.md` — API documentation (to be created during build).

## Working Style
- Always use Context7 (`mcp__context7__resolve-library-id` → `mcp__context7__query-docs`) for up-to-date library docs before writing code against any dependency.
- Prefer clarity over cleverness. Production-sensible, not over-engineered. Keep it simple enough for one developer to maintain.

## Supabase
- **Always** use the `supabase` skill (`.commandcode/skills/supabase/SKILL.md`) for any Supabase-related work — Auth, Database, Edge Functions, Realtime, Storage, Vectors, Cron, Queues, RLS policies, schema migrations, or client integrations.
- **Always** use the Postgres best practices skill (`.commandcode/skills/supabase-postgres-best-practices/SKILL.md`) when writing or reviewing queries and schema designs.
- **Always** use the `mcp__supabase` MCP tools (e.g., `mcp__supabase__list_migration_files`, `mcp__supabase__run_migration`) for Supabase CLI operations — migrations, schema changes, and local DB management.

## UI / UX
- **Always** use the `ui-ux-pro-max` skill for all UI/UX work — before building, modifying, or reviewing any interface, run it to get design system recommendations.
- Always use shadcn/ui components (Button, Input, Label, Card, Select, etc.) for all UI. Never use plain HTML inputs/buttons/selects when a shadcn component exists.
- The project's design system is persisted at `design-system/safeready/MASTER.md` — reference it before any UI work.
- **Hierarchical override rule:** When building a specific page, check `design-system/safeready/pages/[page-name].md` first. If it exists, its rules override MASTER.md. Otherwise, use MASTER.md exclusively.
- To generate page-specific overrides: `python3 .commandcode/skills/ui-ux-pro-max/scripts/search.py "<context>" --design-system --persist -p "SafeReady" --page "<page-name>"`
- **Pre-delivery checklist** (always run before landing UI code):
  - No emojis as icons (use SVG: Lucide/Heroicons)
  - `cursor-pointer` on all clickable elements
  - Hover states with smooth transitions (150-300ms)
  - Light mode text contrast 4.5:1 minimum
  - Focus states visible for keyboard navigation
  - `prefers-reduced-motion` respected
  - Responsive breakpoints: 375px, 768px, 1024px, 1440px
  - No horizontal scroll on mobile

## Testing
- The project uses **Vitest** for unit/integration tests. Config is at the repo root.
- Tests live next to the code they test as `*.test.ts` or `*.test.tsx` co-located files.
- All test files follow the pattern: `src/<domain>/__tests__/<module>.test.ts` for shared utilities, or `.test.tsx` co-located with the component for React modules.
- Use the `test-runner` agent (`.commandcode/agents/test-runner.md`) after implementing any important feature — it handles test creation and suite validation automatically.
