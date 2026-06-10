import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { NotificationBell } from "../notification-bell"

describe("NotificationBell", () => {
  it("renders bell icon", () => {
    render(<NotificationBell initialUnreadCount={0} />)
    expect(screen.getByLabelText("Notifications")).toBeInTheDocument()
  })

  it("shows unread count badge", () => {
    render(<NotificationBell initialUnreadCount={5} />)
    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("does not show badge when unread count is 0", () => {
    render(<NotificationBell initialUnreadCount={0} />)
    expect(screen.queryByText("0")).not.toBeInTheDocument()
  })

  it("shows 9+ for counts over 9", () => {
    render(<NotificationBell initialUnreadCount={15} />)
    expect(screen.getByText("9+")).toBeInTheDocument()
  })
})
