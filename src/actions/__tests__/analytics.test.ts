import { describe, it, expect, vi, beforeEach } from "vitest"
import { getAnalytics } from "@/actions/analytics"

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
    workspaceMember: { findFirst: vi.fn(), findMany: vi.fn() },
    taskOccurrence: { findMany: vi.fn() },
  },
}))

const { auth } = await import("@/lib/auth")
const { db } = await import("@/lib/db")

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getAnalytics", () => {
  it("throws if no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    await expect(getAnalytics()).rejects.toThrow("Unauthorized")
  })

  it("throws if no workspace membership", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue(null)
    await expect(getAnalytics()).rejects.toThrow("No workspace found")
  })

  it("returns analytics data with completed occurrences", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01",
      workspaceId: "ws_01",
      userId: "user_01",
      role: "owner",
      invitedAt: new Date(),
      joinedAt: new Date(),
    })
    const dueDate = new Date("2026-06-01")
    vi.mocked(db.taskOccurrence.findMany).mockResolvedValue([
      {
        id: "occ_01",
        workspaceId: "ws_01",
        taskId: "task_01",
        status: "completed",
        dueDate,
        completedAt: new Date("2026-05-30"),
        completedByUserId: "user_01",
        completedByName: null,
        notes: null,
        task: { category: "fire_safety" },
      },
    ])
    vi.mocked(db.workspaceMember.findMany).mockResolvedValue([
      {
        id: "member_01",
        workspaceId: "ws_01",
        userId: "user_01",
        role: "owner",
        invitedAt: new Date(),
        joinedAt: new Date(),
        user: { name: "Test User" },
      },
    ])

    const result = await getAnalytics()

    expect(result.totalCompleted).toBe(1)
    expect(result.totalOnTime).toBe(1)
    expect(result.overallCompliance).toBe(100)
    expect(result.teamStats).toHaveLength(1)
  })

  it("returns 100% compliance when no completed tasks", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01",
      workspaceId: "ws_01",
      userId: "user_01",
      role: "owner",
      invitedAt: new Date(),
      joinedAt: new Date(),
    })
    vi.mocked(db.taskOccurrence.findMany).mockResolvedValue([])
    vi.mocked(db.workspaceMember.findMany).mockResolvedValue([])

    const result = await getAnalytics()

    expect(result.totalCompleted).toBe(0)
    expect(result.overallCompliance).toBe(100)
  })
})
