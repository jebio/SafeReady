"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"

export interface InspectionPackData {
  workspaceName: string
  generatedAt: string
  sector: string | null
  address: string | null
  contactName: string | null
  contactEmail: string | null
  phone: string | null
  summary: {
    totalTasks: number
    completedOnTime: number
    overdueCount: number
    complianceScore: number
    totalEvidence: number
  }
  completedItems: {
    id: string
    taskTitle: string
    category: string | null
    frequency: string
    completedAt: Date
    completedByName: string | null
    notes: string | null
    evidenceCount: number
  }[]
}

export async function getInspectionPack(): Promise<InspectionPackData | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
  })
  if (!member) return null

  const now = new Date()
  const [completedOccurrences, allOccurrences, totalEvidence] = await Promise.all([
    db.taskOccurrence.findMany({
      where: {
        workspaceId: member.workspaceId,
        status: "completed",
        completedAt: { not: null },
      },
      include: {
        task: { select: { title: true, category: true, frequency: true } },
      },
      orderBy: { completedAt: "desc" },
    }),
    db.taskOccurrence.findMany({
      where: { workspaceId: member.workspaceId },
    }),
    db.evidenceFile.count({
      where: { workspaceId: member.workspaceId },
    }),
  ])

  const overdueCount = allOccurrences.filter(
    (o) => o.status === "due" && o.dueDate < now,
  ).length
  const completedOnTime = completedOccurrences.filter(
    (o) => o.completedAt! <= o.dueDate,
  ).length
  const complianceScore =
    completedOccurrences.length > 0
      ? Math.round((completedOnTime / completedOccurrences.length) * 100)
      : 100

  return {
    workspaceName: member.workspace.name,
    generatedAt: now.toISOString(),
    sector: member.workspace.sector,
    address: member.workspace.address,
    contactName: member.workspace.contactName,
    contactEmail: member.workspace.contactEmail,
    phone: member.workspace.phone,
    summary: {
      totalTasks: allOccurrences.length,
      completedOnTime,
      overdueCount,
      complianceScore,
      totalEvidence,
    },
    completedItems: completedOccurrences.map((o) => ({
      id: o.id,
      taskTitle: o.task.title,
      category: o.task.category,
      frequency: o.task.frequency,
      completedAt: o.completedAt!,
      completedByName: o.completedByName,
      notes: o.notes,
      evidenceCount: 0,
    })),
  }
}
