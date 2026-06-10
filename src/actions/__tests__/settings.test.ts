import { describe, it, expect, vi, beforeEach } from "vitest"
import { getWorkspaceSettings, getAuditLog } from "@/actions/settings"

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock("@/lib/db", () => ({
  db: {
    workspaceMember: { findFirst: vi.fn() },
    auditLog: { findMany: vi.fn() },
  },
}))

const { auth } = await import("@/lib/auth")
const { db } = await import("@/lib/db")

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getWorkspaceSettings", () => {
  it("throws if no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    await expect(getWorkspaceSettings()).rejects.toThrow("Unauthorized")
  })

  it("returns workspace settings with role", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "owner",
      invitedAt: new Date(), joinedAt: new Date(),
      workspace: {
        id: "ws_01", name: "Test Workspace", sector: "office", address: "123 St",
        contactName: "Test", contactEmail: "test@test.com", phone: "01234567890",
        trialEndsAt: null, createdAt: new Date(), updatedAt: new Date(),
      },
    })

    const result = await getWorkspaceSettings()
    expect(result.workspace.name).toBe("Test Workspace")
    expect(result.role).toBe("owner")
  })
})

describe("getAuditLog", () => {
  it("returns empty if no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    expect(await getAuditLog()).toEqual([])
  })

  it("returns audit log entries", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "owner",
      invitedAt: new Date(), joinedAt: new Date(),
    })
    vi.mocked(db.auditLog.findMany).mockResolvedValue([
      {
        id: "log_01", workspaceId: "ws_01", actorUserId: "user_01", actionType: "task.completed",
        entityType: "task_occurrence", entityId: "occ_01", metadata: null, createdAt: new Date(),
        actor: { name: "Test User" },
      },
    ])

    const result = await getAuditLog()
    expect(result).toHaveLength(1)
    expect(result[0].actionType).toBe("task.completed")
    expect(result[0].actorName).toBe("Test User")
  })
})
