"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  ClipboardCheck,
  History,
  FileText,
  Users,
  Settings,
  BarChart3,
  ListChecks,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/sidebar-context"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/checklists", label: "Checklists", icon: ClipboardCheck },
  { href: "/checklists/manage", label: "Manage Tasks", icon: ListChecks },
  { href: "/history", label: "History", icon: History },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/inspection-pack", label: "Inspection Pack", icon: FileText },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function AppSidebar() {
  const { isOpen, close } = useSidebar()

  return (
    <>
      {/* Overlay backdrop on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex w-56 flex-col border-r bg-card transition-transform duration-300",
          // Desktop: always visible
          "lg:relative lg:translate-x-0",
          // Mobile: overlay drawer
          "fixed inset-y-0 left-0 z-50",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link
            href="/dashboard"
            className="text-lg font-semibold"
            onClick={close}
          >
            SafeReady
          </Link>
          <button
            onClick={close}
            className="flex cursor-pointer items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-secondary hover:text-secondary-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
