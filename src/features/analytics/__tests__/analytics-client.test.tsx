import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { AnalyticsClient } from "../analytics-client"

const baseData = {
  overallCompliance: 85,
  totalCompleted: 40,
  totalOnTime: 34,
  monthlyTrend: [
    { month: "2026-01", label: "Jan 2026", completed: 10, onTime: 8, percentage: 80 },
    { month: "2026-02", label: "Feb 2026", completed: 8, onTime: 7, percentage: 87 },
  ],
  mostMissedCategories: [
    { category: "fire_safety", total: 20, missed: 5, missRate: 25 },
  ],
  teamStats: [
    { name: "Alice", completed: 30 },
    { name: "Bob", completed: 10 },
  ],
}

describe("AnalyticsClient", () => {
  it("renders compliance score", () => {
    render(<AnalyticsClient data={baseData} />)
    expect(screen.getByText("85%")).toBeInTheDocument()
  })

  it("renders total completed", () => {
    render(<AnalyticsClient data={baseData} />)
    expect(screen.getByText("40")).toBeInTheDocument()
  })

  it("renders monthly trend labels", () => {
    render(<AnalyticsClient data={baseData} />)
    expect(screen.getByText("Jan 2026")).toBeInTheDocument()
    expect(screen.getByText("Feb 2026")).toBeInTheDocument()
  })

  it("renders most-missed categories", () => {
    render(<AnalyticsClient data={baseData} />)
    // Category value renders as-is (capitalize CSS only affects the first letter)
    expect(screen.getByText("fire_safety")).toBeInTheDocument()
  })

  it("renders team stats", () => {
    render(<AnalyticsClient data={baseData} />)
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("shows empty state when no data", () => {
    render(<AnalyticsClient data={{ ...baseData, mostMissedCategories: [], teamStats: [] }} />)
    expect(screen.getAllByText("No data yet")).toHaveLength(2)
  })
})
