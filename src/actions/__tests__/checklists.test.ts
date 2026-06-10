import { describe, it, expect, vi, beforeEach } from "vitest"
import { getTasks, getDashboardStats } from "@/actions/checklists"

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
    checklistTask: { findMany: vi.fn() },
    taskOccurrence: { findMany: vi.fn() },
  },
}))

const { auth } = await import("@/lib/auth")
const { db } = await import("@/lib/db")

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getTasks", () => {
  it("throws if no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    await expect(getTasks()).rejects.toThrow("Unauthorized")
  })

  it("returns empty array if no workspace", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue(null)
    expect(await getTasks()).toEqual([])
  })

  it("returns tasks with current occurrence", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "staff",
      invitedAt: new Date(), joinedAt: new Date(),
    })
    vi.mocked(db.checklistTask.findMany).mockResolvedValue([{
      id: "task_01", workspaceId: "ws_01", templateItemId: null, title: "Fire Check",
      description: "Check extinguisher", category: "fire_safety", frequency: "monthly",
      evidenceRequired: true, notesHint: "Check pressure", sourceLabel: null, sourceUrl: null,
      sortOrder: 0, assignedUserId: null, active: true, createdByUserId: "user_01",
      createdAt: new Date(), updatedAt: new Date(),
      occurrences: [
        {
          id: "occ_01", workspaceId: "ws_01", taskId: "task_01", dueDate: new Date(),
          status: "due", completedAt: null, completedByName: null, completedByUserId: null, notes: null,
        },
      ],
    }])

    const result = await getTasks()
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe("Fire Check")
    expect(result[0].currentOccurrence?.status).toBe("due")
  })
})

describe("getDashboardStats", () => {
  it("returns zeroed stats if no workspace", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue(null)

    const result = await getDashboardStats()
    expect(result.totalTasks).toBe(0)
    expect(result.workspaceName).toBe("")
  })

  it("calculates compliance correctly", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "owner",
      invitedAt: new Date(), joinedAt: new Date(),
      workspace: { id: "ws_01", name: "Test WS", sector: "office", address: null, contactName: null, contactEmail: null, phone: null, trialEndsAt: null, createdAt: new Date(), updatedAt: new Date() },
    })
    vi.mocked(db.taskOccurrence.findMany).mockResolvedValue([
      { id: "occ_01", workspaceId: "ws_01", taskId: "t1", status: "completed", dueDate: new Date("2026-06-01"), completedAt: new Date("2026-05-30"), completedByUserId: "u1", completedByName: null, notes: null },
      { id: "occ_02", workspaceId: "ws_01", taskId: "t2", status: "completed", dueDate: new Date("2026-06-01"), completedAt: new Date("2026-06-05"), completedByUserId: "u1", completedByName: null, notes: null },
      { id: "occ_03", workspaceId: "ws_01", taskId: "t3", status: "due", dueDate: new Date("2026-06-15"), completedAt: null, completedByUserId: null, completedByName: null, notes: null },
    ])

    const result = await getDashboardStats()
    expect(result.totalTasks).toBe(3)
    expect(result.completedCount).toBe(2)
    expect(result.dueCount).toBe(1)
    expect(result.complianceScore).toBe(50) // 1 of 2 on time
  })
})
