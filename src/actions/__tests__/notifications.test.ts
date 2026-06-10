import { describe, it, expect, vi, beforeEach } from "vitest"
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead, createNotification } from "@/actions/notifications"

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
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
    notification: { findMany: vi.fn(), count: vi.fn(), update: vi.fn(), updateMany: vi.fn(), create: vi.fn() },
  },
}))

const { auth } = await import("@/lib/auth")
const { db } = await import("@/lib/db")

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getNotifications", () => {
  it("returns empty if no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    expect(await getNotifications()).toEqual([])
  })

  it("returns notifications for the workspace", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "staff",
      invitedAt: new Date(), joinedAt: new Date(),
    })
    vi.mocked(db.notification.findMany).mockResolvedValue([
      { id: "n_01", workspaceId: "ws_01", userId: "user_01", type: "task_assigned", title: "Test notification", body: "Body text", readAt: null, createdAt: new Date() },
    ])

    const result = await getNotifications()
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe("Test notification")
    expect(result[0].readAt).toBeNull()
  })
})

describe("getUnreadCount", () => {
  it("returns 0 if no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    expect(await getUnreadCount()).toBe(0)
  })

  it("returns unread count", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "staff",
      invitedAt: new Date(), joinedAt: new Date(),
    })
    vi.mocked(db.notification.count).mockResolvedValue(3)
    expect(await getUnreadCount()).toBe(3)
  })
})

describe("markNotificationRead", () => {
  it("returns early if no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    await markNotificationRead("n_01")
    expect(db.notification.update).not.toHaveBeenCalled()
  })

  it("marks a notification as read", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "staff",
      invitedAt: new Date(), joinedAt: new Date(),
    })
    await markNotificationRead("n_01")
    expect(db.notification.update).toHaveBeenCalledWith({
      where: { id: "n_01" },
      data: { readAt: expect.any(Date) },
    })
  })
})

describe("markAllNotificationsRead", () => {
  it("returns early if no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    await markAllNotificationsRead()
    expect(db.notification.updateMany).not.toHaveBeenCalled()
  })
})

describe("createNotification", () => {
  it("creates a notification record", async () => {
    await createNotification("ws_01", "task_assigned", "New task", "Body", "user_01")
    expect(db.notification.create).toHaveBeenCalledWith({
      data: {
        workspaceId: "ws_01",
        type: "task_assigned",
        title: "New task",
        body: "Body",
        userId: "user_01",
      },
    })
  })
})
