import { describe, it, expect, vi, beforeEach } from "vitest"
import { getHistory, getTeamMembers } from "@/actions/history"

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
    checklistTask: { findMany: vi.fn() },
    evidenceFile: { count: vi.fn() },
  },
}))

const { auth } = await import("@/lib/auth")
const { db } = await import("@/lib/db")

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getHistory", () => {
  it("throws if no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    await expect(getHistory()).rejects.toThrow("Unauthorized")
  })

  it("returns empty if no workspace membership", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue(null)
    const result = await getHistory()
    expect(result).toEqual({ items: [], categories: [] })
  })

  it("returns completed tasks with categories", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "staff" as const,
      invitedAt: new Date(), joinedAt: new Date(),
    })
    vi.mocked(db.taskOccurrence.findMany).mockResolvedValue([
      {
        id: "occ_01", workspaceId: "ws_01", taskId: "task_01", status: "completed" as const,
        dueDate: new Date(), completedAt: new Date("2026-06-01"), completedByUserId: "user_01",
        completedByName: "Test User", notes: null,
        task: { title: "Fire Extinguisher Check", category: "fire_safety", frequency: "monthly" },
      },
    ])
    vi.mocked(db.checklistTask.findMany).mockResolvedValue([
      { id: "task_01", workspaceId: "ws_01", category: "fire_safety", active: true, templateItemId: null, title: "Fire Extinguisher Check", description: null, frequency: "monthly", evidenceRequired: false, notesHint: null, sourceLabel: null, sourceUrl: null, sortOrder: 0, assignedUserId: null, createdByUserId: "user_01", createdAt: new Date(), updatedAt: new Date() },
    ])
    vi.mocked(db.evidenceFile.count).mockResolvedValue(2)

    const result = await getHistory()

    expect(result.items).toHaveLength(1)
    expect(result.items[0].taskTitle).toBe("Fire Extinguisher Check")
    expect(result.items[0].evidenceCount).toBe(2)
    expect(result.categories).toContain("fire_safety")
  })
})

describe("getTeamMembers", () => {
  it("returns empty array if no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    const result = await getTeamMembers()
    expect(result).toEqual([])
  })

  it("returns members for workspace", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "staff" as const,
      invitedAt: new Date(), joinedAt: new Date(),
    })
    vi.mocked(db.workspaceMember.findMany).mockResolvedValue([
      {
        id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "staff" as const,
        invitedAt: new Date(), joinedAt: new Date(),
        user: { id: "user_01", name: "Test User", email: "test@test.com" },
      },
    ])

    const result = await getTeamMembers()
    expect(result).toEqual([{ id: "user_01", name: "Test User" }])
  })
})
