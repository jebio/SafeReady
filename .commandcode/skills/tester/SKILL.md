---
name: tester
description: "Create unit, component, and end-to-end tests for SafeReady features. Use this whenever a feature is added or modified — or when asked to create tests for existing code. Triggers on keywords: 'write tests', 'add tests', 'test this', 'unit test', 'component test', 'e2e test', 'coverage', 'testing strategy', 'test plan'."
metadata:
  author: SafeReady
  version: "0.2.0"
---

# SafeReady Test Agent

## Core Principles

**1. Test the right level.** Every test belongs to exactly one of three layers:
- **Unit** — Pure logic (lib/utils, recurrence, validation schemas, auth helpers)
- **Component (Integration)** — Server Actions with DB, React components with user interaction
- **E2E** — Full user flows through the app (login → complete task → see analytics)

**2. Vitest v4 for everything unit + component.** Vitest runs both unit and component/integration tests. E2E uses Playwright.

**3. Mock at boundaries, not everywhere.**
- External services (Supabase Storage, Resend email) get mocked
- Prisma DB gets a real test database via `supabase db branch` + seed
- Better-Auth sessions get mocked at the `auth()` call

**4. First-time setup must happen before any test can run.** If `@testing-library/react`, `jsdom`, or `@playwright/test` are missing, install them first.

**5. Test file structure mirrors source structure:**

```
src/
├── lib/__tests__/           # Unit tests for utilities
├── actions/__tests__/       # Integration tests for Server Actions
├── features/*/__tests__/    # Component tests (RTL + jsdom)
├── components/__tests__/    # Shared component tests
├── app/api/*/__tests__/     # API route tests
e2e/                         # Playwright E2E tests (root level)
```

---

## Step 1: First-Time Setup

Run these once before the first test session:

### 1.1 Install test dependencies

```bash
bun add -d @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @playwright/test
```

### 1.2 Update vitest.config.ts

```ts
import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

Create a component-specific config:

```ts
// vitest.component.config.ts
import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

Add to `package.json` scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:component": "vitest run --config vitest.component.config.ts",
  "test:e2e": "playwright test",
  "test:ci": "vitest run && vitest run --config vitest.component.config.ts"
}
```

### 1.3 Create test setup file

```ts
// src/test/setup.ts
import "@testing-library/jest-dom"

// Polyfill for Next.js server action redirect
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000"
```

### 1.4 Create test helper factories

```ts
// src/test/factories.ts
/**
 * Factory functions for creating test data.
 * Use these in both unit/component tests and action integration tests.
 *
 * All factories return partial entity shapes — spread what you need.
 */
import type { Role, TaskStatus, WorkspaceMember } from "@prisma/client"

export const makeUser = (overrides: Partial<{ id: string; name: string; email: string }> = {}) => ({
  id: overrides.id ?? "user_01",
  name: overrides.name ?? "Test User",
  email: overrides.email ?? "test@example.com",
  emailVerified: false,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const makeWorkspace = (overrides: Partial<{ id: string; name: string; sector: string }> = {}) => ({
  id: overrides.id ?? "ws_01",
  name: overrides.name ?? "Test Workspace",
  sector: overrides.sector ?? "office",
  address: "123 Test St",
  contactName: "Test",
  contactEmail: "test@example.com",
  phone: "01234567890",
  trialEndsAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const makeMember = (overrides: {
  id?: string
  workspaceId?: string
  userId?: string
  role?: Role
} = {}) => ({
  id: overrides.id ?? "member_01",
  workspaceId: overrides.workspaceId ?? "ws_01",
  userId: overrides.userId ?? "user_01",
  role: overrides.role ?? "owner",
  invitedAt: new Date(),
  joinedAt: new Date(),
})

export const makeTask = (overrides: Partial<{
  id: string
  workspaceId: string
  title: string
  frequency: string
  evidenceRequired: boolean
  active: boolean
  assignedUserId: string
  createdByUserId: string
}> = {}) => ({
  id: overrides.id ?? "task_01",
  workspaceId: overrides.workspaceId ?? "ws_01",
  templateItemId: null,
  title: overrides.title ?? "Test Task",
  description: "A test task",
  category: "fire_safety",
  frequency: overrides.frequency ?? "monthly",
  evidenceRequired: overrides.evidenceRequired ?? false,
  sourceLabel: null,
  sourceUrl: null,
  sortOrder: 0,
  assignedUserId: overrides.assignedUserId ?? "member_01",
  active: overrides.active ?? true,
  createdByUserId: overrides.createdByUserId ?? "user_01",
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const makeOccurrence = (overrides: Partial<{
  id: string
  workspaceId: string
  taskId: string
  dueDate: Date
  status: "due" | "completed"
}> = {}) => ({
  id: overrides.id ?? "occ_01",
  workspaceId: overrides.workspaceId ?? "ws_01",
  taskId: overrides.taskId ?? "task_01",
  dueDate: overrides.dueDate ?? new Date(),
  status: overrides.status ?? "due",
  completedAt: null,
  completedByUserId: null,
  notes: null,
})
```

### 1.5 Create mock helpers

```ts
// src/test/mocks.ts
/**
 * Mock modules that are unsafe or impractical in a test environment.
 * Call these in `beforeAll` or at the top of test files.
 */
import { vi } from "vitest"

/** Mock auth() to return a specific user + session */
export function mockAuth(userId = "user_01", workspaceMemberId = "member_01") {
  vi.mock("@/lib/auth", () => ({
    auth: vi.fn(() =>
      Promise.resolve({
        user: { id: userId, name: "Test User", email: "test@example.com" },
        session: { id: "sess_01" },
      })
    ),
  }))
}

/** Mock Prisma entirely — override specific models inline */
export function mockPrisma() {
  vi.mock("@/lib/db", () => ({
    prisma: {
      user: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
      workspace: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
      workspaceMember: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
      checklistTask: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
      taskOccurrence: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
      auditLog: { create: vi.fn() },
      notification: { create: vi.fn() },
      // ... add more models as needed
      $transaction: vi.fn((fn) => fn(prisma)),
    },
  }))
}
```

---

## Step 2: Decide What to Test

After any feature implementation or modification, run through this checklist and create tests for every layer that applies.

### Layer Decision Matrix

| Component Type | Unit | Component (integration) | E2E |
|---|---|---|---|
| `lib/*.ts` (pure functions) | ✅ Required | — | — |
| `lib/auth.ts`, `lib/db.ts` | — | ✅ Required | — |
| `actions/*.ts` (Server Actions) | — | ✅ Required | — |
| `components/ui/*.tsx` | — | ✅ Required | — |
| `features/*/` (feature components) | — | ✅ Required | — |
| `features/*/` (forms, wizards) | — | ✅ Required | — |
| Full user flows (auth, onboarding, task lifecycle) | — | — | ✅ Required |
| `app/api/*/route.ts` | — | ✅ Required | — |

---

## Step 3: Write Unit Tests (lib/ utilities)

### Pattern

Pure functions, no DB or framework dependencies needed.

```ts
// src/lib/__tests__/recurrence.test.ts
import { describe, it, expect } from "vitest"
import { computeNextDueDate } from "@/lib/recurrence"

describe("computeNextDueDate", () => {
  it("returns next day for daily frequency", () => {
    const result = computeNextDueDate(new Date("2026-01-01"), "daily")
    expect(result).toEqual(new Date("2026-01-02"))
  })

  it("returns next month for monthly frequency", () => {
    const result = computeNextDueDate(new Date("2026-01-15"), "monthly")
    expect(result).toEqual(new Date("2026-02-15"))
  })

  it("throws for invalid frequency", () => {
    expect(() => computeNextDueDate(new Date(), "invalid" as any)).toThrow()
  })
})
```

### What to test in unit tests
- All branches (if/else, early returns)
- Edge cases (null/undefined inputs, boundary dates, empty arrays)
- Error paths (thrown errors, rejected promises)
- Pure transformation functions (formatDate, cn, constants)

---

## Step 4: Write Component (Integration) Tests

### 4.1 Server Action Tests

Server Actions call Prisma and auth. Mock the DB layer; test the logic.

```ts
// src/actions/__tests__/checklists.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "@/lib/db"
import { getTasks, completeTask } from "@/actions/checklists"
import { mockAuth } from "@/test/mocks"
import { makeWorkspace, makeTask, makeOccurrence, makeMember } from "@/test/factories"

beforeEach(() => {
  vi.restoreAllMocks()
  mockAuth("user_01", "member_01")
})

describe("getTasks", () => {
  it("returns active tasks for the workspace with their current occurrence", async () => {
    vi.mocked(prisma.workspaceMember.findFirst).mockResolvedValue(makeMember())
    vi.mocked(prisma.checklistTask.findMany).mockResolvedValue([
      makeTask({
        id: "task_01",
        title: "Fire Extinguisher Check",
        frequency: "monthly",
      }),
    ])
    vi.mocked(prisma.taskOccurrence.findMany).mockResolvedValue([
      makeOccurrence({ taskId: "task_01", status: "due" }),
    ])

    const result = await getTasks({ workspaceId: "ws_01" })

    expect(result).toHaveLength(1)
    expect(result[0].title).toBe("Fire Extinguisher Check")
  })

  it("filters by status when provided", async () => {
    // ...
  })
})

describe("completeTask", () => {
  it("marks occurrence completed and creates next due occurrence", async () => {
    vi.mocked(prisma.workspaceMember.findFirst).mockResolvedValue(makeMember())
    vi.mocked(prisma.taskOccurrence.findUnique).mockResolvedValue(
      makeOccurrence({ id: "occ_01", status: "due" })
    )
    vi.mocked(prisma.taskOccurrence.update).mockResolvedValue(
      makeOccurrence({ id: "occ_01", status: "completed" })
    )
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)
    vi.mocked(prisma.notification.create).mockResolvedValue({} as any)

    const result = await completeTask({
      workspaceId: "ws_01",
      occurrenceId: "occ_01",
      notes: "All good",
    })

    expect(result.success).toBe(true)
  })

  it("rejects if occurrence is already completed", async () => {
    vi.mocked(prisma.workspaceMember.findFirst).mockResolvedValue(makeMember())
    vi.mocked(prisma.taskOccurrence.findUnique).mockResolvedValue(
      makeOccurrence({ id: "occ_01", status: "completed" })
    )

    await expect(
      completeTask({ workspaceId: "ws_01", occurrenceId: "occ_01" })
    ).rejects.toThrow(/already completed/i)
  })
})
```

### 4.2 React Component Tests

Components render UI and handle user interaction. Use RTL + jsdom.

```tsx
// src/features/dashboard/__tests__/stats-cards.test.tsx
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StatsCards } from "../stats-cards"

describe("StatsCards", () => {
  const defaultProps = {
    totalTasks: 20,
    dueTasks: 5,
    overdueTasks: 3,
    completedThisMonth: 12,
  }

  it("renders all stat cards with correct values", () => {
    render(<StatsCards {...defaultProps} />)

    expect(screen.getByText("20")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("12")).toBeInTheDocument()
  })

  it("shows overdue in red/destructive styling when > 0", () => {
    render(<StatsCards {...defaultProps} />)
    const overdueCard = screen.getByText("3").closest('[data-testid="stat-card"]')
    expect(overdueCard).toHaveClass("text-red-600") // or whatever style is used
  })

  it("handles zero values gracefully", () => {
    render(<StatsCards totalTasks={0} dueTasks={0} overdueTasks={0} completedThisMonth={0} />)
    expect(screen.getByText("0")).toBeInTheDocument()
  })
})
```

### Component test patterns for different scenarios:

**Dialog / Modal:**
```tsx
// Use RTL's dialog queries
expect(screen.getByRole("dialog")).toBeInTheDocument()
await user.click(screen.getByRole("button", { name: /cancel/i }))
expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
```

**Form interactions:**
```tsx
await user.type(screen.getByLabelText(/email/i), "test@example.com")
await user.click(screen.getByRole("button", { name: /submit/i }))
expect(screen.getByText(/success/i)).toBeInTheDocument()
```

**Server Action integration:**
```tsx
// Mock the server action module
vi.mock("@/actions/checklists", () => ({
  completeTask: vi.fn().mockResolvedValue({ success: true }),
}))
```

### 4.3 API Route Tests

```ts
// src/app/api/evidence/upload/__tests__/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../route"
import { mockAuth } from "@/test/mocks"

describe("POST /api/evidence/upload", () => {
  beforeEach(() => {
    mockAuth("user_01")
  })

  it("rejects unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValue({ user: null, session: null })

    const req = new Request("http://localhost/api/evidence/upload", {
      method: "POST",
      body: new FormData(),
    })

    const response = await POST(req)
    expect(response.status).toBe(401)
  })

  it("validates file type and size", async () => {
    const formData = new FormData()
    formData.append("file", new Blob(["x".repeat(6 * 1024 * 1024)], { type: "video/mp4" }))

    const req = new Request("http://localhost/api/evidence/upload", {
      method: "POST",
      body: formData,
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })
})
```

---

## Step 5: Write E2E Tests

E2E tests cover the **happy path** for each major user flow. They run against a real or preview deployment.

### Setup

```bash
npx playwright init --browser chromium
```

This creates `playwright.config.ts` and `.github/workflows/playwright.yml`.

### Configuration

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "bun run dev",
    port: 3000,
    reuseExistingServer: true,
  },
})
```

### Test patterns

```ts
// e2e/login.spec.ts
import { test, expect } from "@playwright/test"

test("user can log in and see dashboard", async ({ page }) => {
  await page.goto("/login")
  await page.fill('input[name="email"]', "demo@example.com")
  await page.fill('input[name="password"]', "password123")
  await page.click('button[type="submit"]')

  // Redirect to dashboard
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.locator("text=Overview")).toBeVisible()
})

test("onboarding flow creates a workspace", async ({ page }) => {
  // Seed data must include a fresh invited user for this
  await page.goto("/signup?token=valid-invite-token")
  // ... fill out signup
  // ... onboarding wizard steps
  await expect(page).toHaveURL(/\/onboarding\/confirm/)
})
```

### Essential E2E flows to cover:

| Flow | Description |
|---|---|
| Login → Dashboard | Auth + landing on dashboard with stats |
| Complete a task | Navigate to checklists → open task → complete → see in history |
| Upload evidence | Complete task requiring evidence → upload file |
| Invite a team member | Team page → send invite → verify in pending list |
| Signup via invite | Click invite link → signup → auto-join workspace |
| Onboarding wizard | Fresh user → create workspace → pick template → confirm |
| Inspection Pack | Filter → generate PDF → verify download |
| Analytics page | View compliance scores and charts |

---

## Step 6: CI/CD Integration

Create a GitHub Actions workflow:

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2

      - run: bun install
      - run: bun run db:generate
      - run: bun run test:ci
```

E2E tests can be a separate workflow that runs on a preview deployment or on PR merge to main.

---

## Step 7: Execution Flow — What to Do When Called

When invoked (e.g., "run the tester on the latest feature" or "generate tests for X"):

1. **Identify what changed.** Read the diff / check recent commits / examine the relevant files.
2. **Classify each changed file** using the Layer Decision Matrix from Step 2.
3. **Pick the right config:**
   - Pure logic → `bun test` (vitest.node.config.ts)
   - React components → `bun test:component` (vitest.component.config.ts)
   - Full flows → `bun test:e2e` (Playwright)
4. **Write tests following the patterns above.**
5. **Run the tests** to verify they pass:
   ```bash
   bun run test               # unit tests
   bun run test:component      # component tests
   bun run test:e2e            # e2e (requires running app or preview)
   ```
6. **Fix failures.** If a test fails because the code is wrong, flag it. If the test is wrong, fix the test.
7. **Generate coverage report** (optional):
   ```bash
   npx vitest run --coverage
   ```

---

## Step 8: When Invoked for "Everything So Far"

When asked to "write tests for the entire existing codebase":

1. Start with unit tests — they have zero dependencies and validate core logic
2. Then server action integration tests (mock Prisma + auth)
3. Then component tests (RTL + jsdom)
4. Then API route tests
5. Then E2E flows for all major user journeys
6. Always run all tests at the end and fix any breakage

Work through items in batches, finishing one layer before starting the next.
