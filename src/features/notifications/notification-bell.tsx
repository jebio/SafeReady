"use client"

import { useState, useCallback } from "react"
import { Bell } from "lucide-react"
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/actions/notifications"
import { formatDate } from "@/lib/utils"
import type { NotificationItem } from "@/actions/notifications"

interface NotificationBellProps {
  initialUnreadCount: number
}

export function NotificationBell({ initialUnreadCount }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [loading, setLoading] = useState(false)

  const handleToggle = useCallback(async () => {
    if (open) {
      setOpen(false)
      return
    }
    setLoading(true)
    const items = await getNotifications()
    setNotifications(items)
    setLoading(false)
    setOpen(true)
  }, [open])

  const handleMarkRead = useCallback(
    async (id: string) => {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n)),
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    },
    [],
  )

  const handleMarkAllRead = useCallback(async () => {
    await markAllNotificationsRead()
    setNotifications((prev) =>
      prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date() })),
    )
    setUnreadCount(0)
  }, [])

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative flex cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <span className="text-sm font-medium">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="cursor-pointer text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No notifications yet
                </p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => !n.readAt && handleMarkRead(n.id)}
                    className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50 ${
                      !n.readAt ? "bg-muted/30" : ""
                    }`}
                  >
                    <div className="flex-1 space-y-0.5">
                      <p className="font-medium">{n.title}</p>
                      {n.body && (
                        <p className="text-xs text-muted-foreground">{n.body}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>
                    {!n.readAt && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
