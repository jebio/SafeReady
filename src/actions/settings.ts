"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export interface AuditLogEntry {
  id: string
  actionType: string
  entityType: string
  actorName: string | null
  metadata: any
  createdAt: Date
}

export async function getWorkspaceSettings() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
  })
  if (!member) throw new Error("No workspace found")

  return {
    workspace: {
      id: member.workspace.id,
      name: member.workspace.name,
      sector: member.workspace.sector,
      address: member.workspace.address,
      contactName: member.workspace.contactName,
      contactEmail: member.workspace.contactEmail,
      phone: member.workspace.phone,
    },
    role: member.role,
  }
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return []

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) return []

  const logs = await db.auditLog.findMany({
    where: { workspaceId: member.workspaceId },
    include: { actor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return logs.map((l) => ({
    id: l.id,
    actionType: l.actionType,
    entityType: l.entityType,
    actorName: l.actor?.name ?? null,
    metadata: l.metadata,
    createdAt: l.createdAt,
  }))
}
