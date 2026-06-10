import { vi } from "vitest"

export function mockAuth(userId = "user_01") {
  vi.mock("@/lib/auth", () => ({
    auth: {
      api: {
        getSession: vi.fn().mockResolvedValue({
          user: { id: userId, name: "Test User", email: "test@example.com" },
          session: { id: "sess_01" },
        }),
      },
    },
  }))
}

export function mockPrisma() {
  const createModel = () => ({
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })

  const db = {
    user: createModel(),
    session: createModel(),
    account: createModel(),
    workspace: createModel(),
    workspaceMember: createModel(),
    invitation: createModel(),
    checklistTask: createModel(),
    taskOccurrence: createModel(),
    evidenceFile: createModel(),
    auditLog: createModel(),
    notification: createModel(),
    systemTemplate: createModel(),
    systemTemplateItem: createModel(),
    $transaction: vi.fn((fn: any) => fn(db)),
  }

  vi.mock("@/lib/db", () => ({ db }))
}

export function mockSupabaseStorage() {
  vi.mock("@/lib/supabase-storage", () => ({
    getSignedUploadUrl: vi.fn().mockResolvedValue({ data: { url: "https://example.com/upload", token: "token" }, error: null }),
    getSignedDownloadUrl: vi.fn().mockResolvedValue({ data: { url: "https://example.com/download" }, error: null }),
    deleteStorageFile: vi.fn().mockResolvedValue({ error: null }),
  }))
}

export function mockResend() {
  vi.mock("@/lib/email", () => ({
    sendInviteEmail: vi.fn().mockResolvedValue({ data: { id: "email_01" }, error: null }),
  }))
}
