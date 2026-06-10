import { describe, it, expect, vi, beforeEach } from "vitest"
import { getMembers, getInvitations, inviteMember, removeMember, cancelInvitation } from "@/actions/team"

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/notifications", () => ({
  createNotification: vi.fn(),
}))

vi.mock("@/lib/email", () => ({
  sendInviteEmail: vi.fn().mockResolvedValue({ ok: true }),
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
    workspaceMember: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
    invitation: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), delete: vi.fn() },
    workspace: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    auditLog: { create: vi.fn() },
    notification: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}))

const { auth } = await import("@/lib/auth")
const { db } = await import("@/lib/db")

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getMembers", () => {
  it("throws if no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    await expect(getMembers()).rejects.toThrow("Unauthorized")
  })

  it("returns members list", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "owner",
      invitedAt: new Date(), joinedAt: new Date(),
    })
    vi.mocked(db.workspaceMember.findMany).mockResolvedValue([
      {
        id: "m_01", workspaceId: "ws_01", userId: "u_01", role: "owner",
        invitedAt: new Date(), joinedAt: new Date(),
        user: { id: "u_01", name: "Alice", email: "alice@test.com", emailVerified: false, image: null, createdAt: new Date(), updatedAt: new Date() },
      },
    ])

    const result = await getMembers()
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("Alice")
  })
})

describe("getInvitations", () => {
  it("throws if no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    await expect(getInvitations()).rejects.toThrow("Unauthorized")
  })

  it("returns pending invitations", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "owner",
      invitedAt: new Date(), joinedAt: new Date(),
    })
    vi.mocked(db.invitation.findMany).mockResolvedValue([
      { id: "inv_01", email: "bob@test.com", workspaceId: "ws_01", token: "tok", role: "staff", expiresAt: new Date(), usedAt: null, createdAt: new Date() },
    ])

    const result = await getInvitations()
    expect(result).toHaveLength(1)
    expect(result[0].email).toBe("bob@test.com")
  })
})

describe("inviteMember", () => {
  const formData = new FormData()
  formData.set("email", "bob@test.com")

  it("returns error if not owner", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "staff",
      invitedAt: new Date(), joinedAt: new Date(),
    })

    const result = await inviteMember({ error: null }, formData)
    expect(result.error).toMatch(/only owners/i)
  })

  it("invites via email when user has no account", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    // First call: current user's membership (owner). Second call: check if invited user is already a member → null
    vi.mocked(db.workspaceMember.findFirst)
      .mockResolvedValueOnce({
        id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "owner",
        invitedAt: new Date(), joinedAt: new Date(),
      })
      .mockResolvedValueOnce(null)
    vi.mocked(db.workspace.findUnique).mockResolvedValue({
      id: "ws_01", name: "Test WS", sector: "office", address: null, contactName: null, contactEmail: null, phone: null, trialEndsAt: null, createdAt: new Date(), updatedAt: new Date(),
    })
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    vi.mocked(db.invitation.findFirst).mockResolvedValue(null)
    vi.mocked(db.invitation.create).mockResolvedValue({
      id: "inv_01", email: "bob@test.com", workspaceId: "ws_01", token: "tok", role: "staff", expiresAt: new Date(), usedAt: null, createdAt: new Date(),
    })

    const result = await inviteMember({ error: null }, formData)
    expect(result.error).toBeNull()
  })
})

describe("removeMember", () => {
  const formData = new FormData()
  formData.set("memberId", "member_02")

  it("returns error if not owner", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "staff",
      invitedAt: new Date(), joinedAt: new Date(),
    })

    const result = await removeMember({ error: null }, formData)
    expect(result.error).toMatch(/only owners/i)
  })
})

describe("cancelInvitation", () => {
  const formData = new FormData()
  formData.set("inviteId", "inv_01")

  it("returns error if not owner", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
      id: "member_01", workspaceId: "ws_01", userId: "user_01", role: "staff",
      invitedAt: new Date(), joinedAt: new Date(),
    })

    const result = await cancelInvitation({ error: null }, formData)
    expect(result.error).toMatch(/only owners/i)
  })
})
