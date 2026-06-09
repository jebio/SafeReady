"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { NotificationBell } from "@/features/notifications/notification-bell"

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

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b bg-card px-6">
      <NotificationBell initialUnreadCount={unreadCount} />
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        {user.name}
      </span>
      <button
        onClick={async () => {
          await authClient.signOut()
          router.push("/login")
        }}
        className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </header>
  )
}
