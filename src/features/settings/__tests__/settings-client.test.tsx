import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { SettingsClient } from "../settings-client"

const baseProps = {
  data: {
    workspace: {
      id: "ws_01",
      name: "Test Workspace",
      sector: "office",
      address: "123 Test St",
      contactName: "Test Contact",
      contactEmail: "test@test.com",
      phone: "01234567890",
    },
    role: "owner",
  },
  auditLog: [
    {
      id: "log_01",
      actionType: "task.completed",
      entityType: "task_occurrence",
      actorName: "Alice",
      metadata: null,
      createdAt: new Date("2026-06-01"),
    },
  ],
}

describe("SettingsClient", () => {
  it("renders workspace details", () => {
    render(<SettingsClient {...baseProps} />)
    expect(screen.getByText("Test Workspace")).toBeInTheDocument()
    expect(screen.getByText("owner")).toBeInTheDocument()
  })

  it("renders audit log entries", () => {
    render(<SettingsClient {...baseProps} />)
    expect(screen.getByText("Task completed")).toBeInTheDocument()
    expect(screen.getByText("by Alice")).toBeInTheDocument()
  })

  it("shows empty state when no audit log", () => {
    render(<SettingsClient {...baseProps} auditLog={[]} />)
    expect(screen.getByText("No activity recorded yet.")).toBeInTheDocument()
  })
})
