"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { z } from "zod"

const acceptInviteSchema = z.object({
  token: z.string(),
})

export async function acceptInvite(formData: FormData): Promise<{ error: string | null }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { error: "Unauthorized" }

  const parsed = acceptInviteSchema.safeParse({
    token: formData.get("token"),
  })
  if (!parsed.success) return { error: "Invalid invite token" }

  const invitation = await db.invitation.findUnique({
    where: { token: parsed.data.token },
  })
  if (!invitation || invitation.usedAt || invitation.expiresAt < new Date()) {
    return { error: "This invitation is invalid or has expired" }
  }
  if (invitation.email !== session.user.email) {
    return { error: "Email mismatch" }
  }

  const existingMember = await db.workspaceMember.findFirst({
    where: { workspaceId: invitation.workspaceId, userId: session.user.id },
  })
  if (existingMember) return { error: "You are already a member" }

  try {
    await db.$transaction([
      db.workspaceMember.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId: session.user.id,
          role: invitation.role,
          invitedEmail: invitation.email,
          invitedAt: invitation.createdAt,
          joinedAt: new Date(),
        },
      }),
      db.invitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      }),
      db.auditLog.create({
        data: {
          workspaceId: invitation.workspaceId,
          actorUserId: session.user.id,
          actionType: "member.joined",
          entityType: "workspace_member",
          entityId: session.user.id,
          metadata: { email: session.user.email, role: invitation.role },
        },
      }),
    ])
  } catch {
    return { error: "Failed to accept invitation" }
  }

  return { error: null }
}
