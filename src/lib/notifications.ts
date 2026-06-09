import { db } from "./db"

interface CreateNotificationParams {
  workspaceId: string
  type: string
  title: string
  body?: string
  userId?: string
}

export async function createNotification(params: CreateNotificationParams) {
  await db.notification.create({
    data: {
      workspaceId: params.workspaceId,
      type: params.type,
      title: params.title,
      body: params.body ?? null,
      userId: params.userId ?? null,
    },
  })
}
