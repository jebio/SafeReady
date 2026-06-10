"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { LogOut, Menu, User } from "lucide-react"
import { NotificationBell } from "@/features/notifications/notification-bell"
import { useSidebar } from "@/components/sidebar-context"

interface AppHeaderProps {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
  unreadCount?: number
}

export function AppHeader({ user, unreadCount = 0 }: AppHeaderProps) {
  const router = useRouter()
  const { toggle } = useSidebar()

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4 lg:px-6">
      <button
        onClick={toggle}
        className="flex cursor-pointer items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center justify-end gap-4">
        <NotificationBell initialUnreadCount={unreadCount} />
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{user.name}</span>
        </span>
        <button
          onClick={async () => {
            await authClient.signOut()
            router.push("/login")
          }}
          className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
