import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { HistoryClient } from "../history-client"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

const baseProps = {
  initialItems: [
    {
      id: "occ_01",
      taskTitle: "Fire Extinguisher Check",
      taskCategory: "fire_safety",
      taskFrequency: "monthly",
      completedAt: new Date("2026-06-01"),
      completedByName: "Alice",
      completedById: "user_01",
      notes: null,
      evidenceCount: 0,
    },
  ],
  categories: ["fire_safety", "first_aid"],
  members: [
    { id: "user_01", name: "Alice" },
    { id: "user_02", name: "Bob" },
  ],
  filters: {},
}

describe("HistoryClient", () => {
  it("renders completed task items", () => {
    render(<HistoryClient {...baseProps} />)
    expect(screen.getByText("Fire Extinguisher Check")).toBeInTheDocument()
  })

  it("renders empty state when no items", () => {
    render(<HistoryClient {...baseProps} initialItems={[]} />)
    expect(screen.getByText("No completed tasks found")).toBeInTheDocument()
  })

  it("renders category filter options", () => {
    render(<HistoryClient {...baseProps} />)
    expect(screen.getByLabelText("Category")).toBeInTheDocument()
  })

  it("renders category badges on items", () => {
    render(<HistoryClient {...baseProps} />)
    // Badge shows raw category value; capitalize CSS only affects first letter
    expect(screen.getByText("fire_safety")).toBeInTheDocument()
  })

  it("shows evidence count when present", () => {
    const items = [{ ...baseProps.initialItems[0], evidenceCount: 3 }]
    render(<HistoryClient {...baseProps} initialItems={items} />)
    expect(screen.getByText("3")).toBeInTheDocument()
  })
})
