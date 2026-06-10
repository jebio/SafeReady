import { describe, it, expect, vi, beforeEach } from "vitest"
import { getInspectionPack } from "@/actions/inspection-pack"

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
    taskOccurrence: { findMany: vi.fn() },
    evidenceFile: { count: vi.fn() },
  },
}))

const { auth } = await import("@/lib/auth")
const { db } = await import("@/lib/db")

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getInspectionPack", () => {
  it("returns null if no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    expect(await getInspectionPack()).toBeNull()
  })

  it("returns null if no workspace membership", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue(null)
    expect(await getInspectionPack()).toBeNull()
  })

  it("returns pack data with completed and due occurrences", async () => {
    const now = new Date()
    const past = new Date(now.getTime() - 86400000)

    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "owner",
      invitedAt: new Date(), joinedAt: new Date(),
      workspace: {
        id: "ws_01", name: "Test Workspace", sector: "office", address: "123 Test St",
        contactName: "Test", contactEmail: "test@test.com", phone: "01234567890",
        trialEndsAt: null, createdAt: new Date(), updatedAt: new Date(),
      },
    })
    vi.mocked(db.taskOccurrence.findMany).mockResolvedValueOnce([
      {
        id: "occ_01", workspaceId: "ws_01", taskId: "task_01", status: "completed",
        dueDate: new Date(), completedAt: new Date(), completedByUserId: "user_01",
        completedByName: "Test User", notes: "All good",
        task: { title: "Fire Extinguisher Check", category: "fire_safety", frequency: "monthly" },
      },
    ])
    vi.mocked(db.taskOccurrence.findMany).mockResolvedValueOnce([
      { id: "occ_01", workspaceId: "ws_01", taskId: "task_01", status: "completed", dueDate: new Date(), completedAt: null, completedByUserId: null, completedByName: null, notes: null },
      { id: "occ_02", workspaceId: "ws_01", taskId: "task_02", status: "due", dueDate: past, completedAt: null, completedByUserId: null, completedByName: null, notes: null },
    ])
    vi.mocked(db.evidenceFile.count).mockResolvedValue(3)

    const result = await getInspectionPack()

    expect(result).not.toBeNull()
    expect(result!.workspaceName).toBe("Test Workspace")
    expect(result!.summary.totalTasks).toBe(2)
    expect(result!.summary.overdueCount).toBe(1)
    expect(result!.summary.totalEvidence).toBe(3)
    expect(result!.completedItems).toHaveLength(1)
  })
})
