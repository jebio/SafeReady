import { describe, it, expect } from "vitest"
import { cn, formatDate } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("resolves tailwind conflicts", () => {
    expect(cn("px-4", "px-6")).toBe("px-6")
  })

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("")
  })
})

describe("formatDate", () => {
  it("formats a Date object in en-GB format", () => {
    const d = new Date("2026-06-10T12:00:00Z")
    expect(formatDate(d)).toBe("10 Jun 2026")
  })

  it("formats a date string", () => {
    expect(formatDate("2026-01-15")).toBe("15 Jan 2026")
  })

  it("handles end of year", () => {
    expect(formatDate("2026-12-31")).toBe("31 Dec 2026")
  })
})
