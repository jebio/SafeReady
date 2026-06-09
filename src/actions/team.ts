"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { sendInviteEmail } from "@/lib/email"
import { addDays } from "date-fns"

export async function getMembers() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) throw new Error("No workspace found")

  const members = await db.workspaceMember.findMany({
    where: { workspaceId: member.workspaceId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  })

  return members.map((m) => ({
    id: m.id,
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    joinedAt: m.joinedAt,
  }))
}

export async function getInvitations() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) throw new Error("No workspace found")

  const invitations = await db.invitation.findMany({
    where: { workspaceId: member.workspaceId, usedAt: null },
    orderBy: { createdAt: "desc" },
  })

  return invitations.map((i) => ({
    id: i.id,
    email: i.email,
    role: i.role,
    expiresAt: i.expiresAt,
    createdAt: i.createdAt,
  }))
}

const inviteSchema = z.object({
  email: z.string().email(),
})

export interface InviteMemberResult {
  error: string | null
  member?: {
    id: string
    userId: string
    name: string
    email: string
    role: string
    joinedAt: Date | null
  }
}

export async function inviteMember(
  prev: { error: string | null },
  formData: FormData,
): Promise<InviteMemberResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { error: "Unauthorized" }

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) return { error: "No workspace found" }
  if (member.role !== "owner") return { error: "Only owners can invite members" }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
  })
  if (!parsed.success) return { error: "Invalid email address" }

  const { email } = parsed.data

  const existingMember = await db.workspaceMember.findFirst({
    where: { workspaceId: member.workspaceId, user: { email } },
  })
  if (existingMember) return { error: "User is already a member" }

  const existingInvite = await db.invitation.findFirst({
    where: { workspaceId: member.workspaceId, email, usedAt: null },
  })
  if (existingInvite) return { error: "Invitation already sent to this email" }

  const workspace = await db.workspace.findUnique({
    where: { id: member.workspaceId },
  })
  if (!workspace) return { error: "Workspace not found" }

  // If the user already has an account (no workspace membership anywhere),
  // auto-link them directly instead of sending an invitation.
  const existingUser = await db.user.findUnique({ where: { email } })
  if (existingUser) {
    const userInAnyWorkspace = await db.workspaceMember.findFirst({
      where: { userId: existingUser.id },
    })
    if (!userInAnyWorkspace) {
      const newMember = await db.workspaceMember.create({
        data: {
          workspaceId: member.workspaceId,
          userId: existingUser.id,
          role: "staff",
          invitedAt: new Date(),
          joinedAt: new Date(),
        },
      })

      await db.auditLog.create({
        data: {
          workspaceId: member.workspaceId,
          actorUserId: session.user.id,
          actionType: "member.added",
          entityType: "workspace_member",
          entityId: newMember.id,
          metadata: { email, autoLinked: true },
        },
      })

      revalidatePath("/team")
      return {
        error: null,
        member: {
          id: newMember.id,
          userId: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          role: newMember.role,
          joinedAt: newMember.joinedAt,
        },
      }
    }
  }

  const token = crypto.randomUUID()

  try {
    const invitation = await db.invitation.create({
      data: {
        email,
        workspaceId: member.workspaceId,
        token,
        role: "staff",
        expiresAt: addDays(new Date(), 7),
      },
    })

    const inviteLink = `${process.env.BETTER_AUTH_URL}/signup?token=${invitation.token}&email=${encodeURIComponent(email)}`

    const result = await sendInviteEmail({
      email,
      inviteLink,
      workspaceName: workspace.name,
      inviterName: session.user.name ?? "A workspace owner",
    })

    if (!result.ok) {
      await db.invitation.delete({ where: { id: invitation.id } })
      return { error: result.error ?? "Failed to send invitation" }
    }

    await db.auditLog.create({
      data: {
        workspaceId: member.workspaceId,
        actorUserId: session.user.id,
        actionType: "invitation.sent",
        entityType: "invitation",
        entityId: invitation.id,
        metadata: { email },
      },
    })
  } catch {
    return { error: "Failed to send invitation" }
  }

  revalidatePath("/team")
  return { error: null }
}

export async function removeMember(
  prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { error: "Unauthorized" }

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) return { error: "No workspace found" }
  if (member.role !== "owner") return { error: "Only owners can remove members" }

  const targetId = formData.get("memberId") as string
  if (!targetId) return { error: "No member specified" }
  if (targetId === member.id) return { error: "You cannot remove yourself" }

  try {
    await db.workspaceMember.delete({ where: { id: targetId } })

    await db.auditLog.create({
      data: {
        workspaceId: member.workspaceId,
        actorUserId: session.user.id,
        actionType: "member.removed",
        entityType: "workspace_member",
        entityId: targetId,
      },
    })
  } catch {
    return { error: "Failed to remove member" }
  }

  revalidatePath("/team")
  return { error: null }
}

export async function cancelInvitation(
  prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { error: "Unauthorized" }

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) return { error: "No workspace found" }
  if (member.role !== "owner") return { error: "Only owners can cancel invitations" }

  const inviteId = formData.get("inviteId") as string
  if (!inviteId) return { error: "No invitation specified" }

  try {
    await db.invitation.delete({ where: { id: inviteId } })
  } catch {
    return { error: "Failed to cancel invitation" }
  }

  revalidatePath("/team")
  return { error: null }
}
