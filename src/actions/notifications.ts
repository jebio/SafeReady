"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export interface NotificationItem {
  id: string
  type: string
  title: string
  body: string | null
  readAt: Date | null
  createdAt: Date
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return []

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) return []

  const notifications = await db.notification.findMany({
    where: {
      workspaceId: member.workspaceId,
      OR: [{ userId: session.user.id }, { userId: null }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    readAt: n.readAt,
    createdAt: n.createdAt,
  }))
}

export async function getUnreadCount(): Promise<number> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return 0

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) return 0

  return db.notification.count({
    where: {
      workspaceId: member.workspaceId,
      OR: [{ userId: session.user.id }, { userId: null }],
      readAt: null,
    },
  })
}

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return

  await db.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  })

  revalidatePath("/", "layout")
}

export async function markAllNotificationsRead(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) return

  await db.notification.updateMany({
    where: {
      workspaceId: member.workspaceId,
      OR: [{ userId: session.user.id }, { userId: null }],
      readAt: null,
    },
    data: { readAt: new Date() },
  })

  revalidatePath("/", "layout")
}

export async function createNotification(
  workspaceId: string,
  type: string,
  title: string,
  body?: string,
  userId?: string,
): Promise<void> {
  await db.notification.create({
    data: {
      workspaceId,
      type,
      title,
      body: body ?? null,
      userId: userId ?? null,
    },
  })
}
