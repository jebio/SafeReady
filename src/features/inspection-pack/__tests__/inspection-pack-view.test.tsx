import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { InspectionPackView } from "../inspection-pack-view"

const baseData = {
  workspaceName: "Test Workspace",
  generatedAt: "2026-06-10T12:00:00Z",
  sector: "office",
  address: "123 Test St",
  contactName: "Test Contact",
  contactEmail: "test@test.com",
  phone: "01234567890",
  summary: {
    totalTasks: 50,
    completedOnTime: 40,
    overdueCount: 3,
    complianceScore: 80,
    totalEvidence: 15,
  },
  completedItems: [
    {
      id: "occ_01",
      taskTitle: "Fire Extinguisher Check",
      category: "fire_safety",
      frequency: "monthly",
      completedAt: new Date("2026-06-01"),
      completedByName: "Alice",
      notes: null,
      evidenceCount: 0,
    },
  ],
}

describe("InspectionPackView", () => {
  it("renders workspace name", () => {
    render(<InspectionPackView data={baseData} />)
    expect(screen.getByText("Test Workspace")).toBeInTheDocument()
  })

  it("renders business details", () => {
    render(<InspectionPackView data={baseData} />)
    expect(screen.getByText("Test Contact")).toBeInTheDocument()
    expect(screen.getByText("test@test.com")).toBeInTheDocument()
  })

  it("renders compliance summary numbers", () => {
    render(<InspectionPackView data={baseData} />)
    expect(screen.getByText("50")).toBeInTheDocument()
    expect(screen.getByText("80%")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  it("renders download PDF button", () => {
    render(<InspectionPackView data={baseData} />)
    expect(screen.getByText("Download PDF")).toBeInTheDocument()
  })

  it("shows empty state when no completed items", () => {
    render(<InspectionPackView data={{ ...baseData, completedItems: [] }} />)
    expect(screen.getByText("No items have been completed yet.")).toBeInTheDocument()
  })
})
