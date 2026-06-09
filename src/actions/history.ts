"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"

interface HistoryFilters {
  from?: string
  to?: string
  category?: string
  completedBy?: string
}

export interface HistoryItem {
  id: string
  taskTitle: string
  taskCategory: string | null
  taskFrequency: string
  completedAt: Date
  completedByName: string | null
  completedById: string | null
  notes: string | null
  evidenceCount: number
}

export async function getHistory(filters: HistoryFilters = {}): Promise<{
  items: HistoryItem[]
  categories: string[]
}> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) return { items: [], categories: [] }

  const where: any = {
    workspaceId: member.workspaceId,
    status: "completed",
  }

  if (filters.from) {
    where.completedAt = { ...where.completedAt, gte: new Date(filters.from) }
  }
  if (filters.to) {
    const toDate = new Date(filters.to)
    toDate.setHours(23, 59, 59, 999)
    where.completedAt = { ...where.completedAt, lte: toDate }
  }
  if (filters.completedBy) {
    where.completedByUserId = filters.completedBy
  }
  if (filters.category) {
    where.task = { category: filters.category }
  }

  const [occurrences, allTasks] = await Promise.all([
    db.taskOccurrence.findMany({
      where,
      include: {
        task: { select: { title: true, category: true, frequency: true } },
      },
      orderBy: { completedAt: "desc" },
    }),
    db.checklistTask.findMany({ where: { workspaceId: member.workspaceId }, select: { category: true } }),
  ])

  const categories = [...new Set(allTasks.map((t) => t.category).filter(Boolean))] as string[]

  const evidenceCounts = await Promise.all(
    occurrences.map((o) =>
      db.evidenceFile.count({ where: { occurrenceId: o.id } }),
    ),
  )

  const items: HistoryItem[] = occurrences.map((o, i) => ({
    id: o.id,
    taskTitle: o.task.title,
    taskCategory: o.task.category,
    taskFrequency: o.task.frequency,
    completedAt: o.completedAt!,
    completedByName: o.completedByName,
    completedById: o.completedByUserId,
    notes: o.notes,
    evidenceCount: evidenceCounts[i],
  }))

  return { items, categories }
}

export async function getTeamMembers(): Promise<{ id: string; name: string }[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return []

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) return []

  const members = await db.workspaceMember.findMany({
    where: { workspaceId: member.workspaceId },
    include: { user: { select: { id: true, name: true } } },
  })

  return members.map((m) => ({ id: m.userId, name: m.user.name }))
}
