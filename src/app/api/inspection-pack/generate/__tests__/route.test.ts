import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "../route"

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

vi.mock("@react-pdf/renderer", () => {
  const ReactPDF = { pdf: () => ({ toBlob: () => Promise.resolve(new Blob(["fake-pdf-content"], { type: "application/pdf" })) }) }
  const StyleSheet = { create: vi.fn().mockReturnValue({}) }
  return { default: ReactPDF, StyleSheet, Document: "Document", Page: "Page", Text: "Text", View: "View" }
})

const { auth } = await import("@/lib/auth")
const { db } = await import("@/lib/db")

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GET /api/inspection-pack/generate", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    const response = await GET()
    expect(response.status).toBe(401)
  })

  it("returns 404 if no workspace membership", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user_01", name: "Test", email: "test@test.com" },
      session: { id: "sess_01" },
    })
    vi.mocked(db.workspaceMember.findFirst).mockResolvedValue(null)

    const response = await GET()
    expect(response.status).toBe(404)
  })

  it("returns PDF with correct headers", async () => {
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
    vi.mocked(db.taskOccurrence.findMany).mockResolvedValueOnce([])
    vi.mocked(db.taskOccurrence.findMany).mockResolvedValueOnce([])
    vi.mocked(db.evidenceFile.count).mockResolvedValue(0)

    const response = await GET()
    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("application/pdf")
    expect(response.headers.get("Content-Disposition")).toContain("inspection_pack.pdf")
  })
})
