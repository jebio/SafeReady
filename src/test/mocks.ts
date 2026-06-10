import { vi } from "vitest"

export function mockAuth(userId = "user_01") {
  vi.mock("@/lib/auth", () => ({
    auth: vi.fn(() =>
      Promise.resolve({
        user: { id: userId, name: "Test User", email: "test@example.com" },
        session: { id: "sess_01" },
      })
    ),
  }))
}

export function mockPrisma() {
  vi.mock("@/lib/db", () => ({
    prisma: {
      user: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      session: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      account: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      workspace: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      workspaceMember: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      invitation: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      checklistTask: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      taskOccurrence: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      evidenceFile: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      auditLog: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      notification: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      systemTemplate: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      systemTemplateItem: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      $transaction: vi.fn((fn: any) => fn(prisma)),
    },
  }))
}

export function mockSupabaseStorage() {
  vi.mock("@/lib/supabase-storage", () => ({
    uploadFile: vi.fn().mockResolvedValue({ data: { path: "evidence/test.pdf" }, error: null }),
    getSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: "https://example.com/file.pdf" }, error: null }),
    deleteFile: vi.fn().mockResolvedValue({ error: null }),
  }))
}

export function mockResend() {
  vi.mock("@/lib/email", () => ({
    sendInviteEmail: vi.fn().mockResolvedValue({ data: { id: "email_01" }, error: null }),
  }))
}
