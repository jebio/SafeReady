import { describe, it, expect } from "vitest"
import { computeNextDueDate } from "@/lib/recurrence"

describe("computeNextDueDate", () => {
  const base = new Date("2026-01-15T12:00:00Z")

  it("adds 1 day for daily frequency", () => {
    const result = computeNextDueDate(base, "daily")
    expect(result.getTime()).toBe(base.getTime() + 86400000)
  })

  it("adds 1 week for weekly frequency", () => {
    const result = computeNextDueDate(base, "weekly")
    expect(result.getTime()).toBe(base.getTime() + 7 * 86400000)
  })

  it("adds 1 month for monthly frequency", () => {
    const result = computeNextDueDate(base, "monthly")
    expect(result.getMonth()).toBe(1) // Feb (0-based)
    expect(result.getDate()).toBe(15)
  })

  it("adds 3 months for quarterly frequency", () => {
    const result = computeNextDueDate(base, "quarterly")
    expect(result.getMonth()).toBe(3) // Apr (0-based)
    expect(result.getDate()).toBe(15)
  })

  it("adds 1 year for yearly frequency", () => {
    const result = computeNextDueDate(base, "yearly")
    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(0)
    expect(result.getDate()).toBe(15)
  })

  it("handles month-end rollover for monthly frequency", () => {
    const jan31 = new Date("2026-01-31T12:00:00Z")
    const result = computeNextDueDate(jan31, "monthly")
    expect(result.getDate()).toBe(28) // Feb 28 (non-leap)
  })
})
