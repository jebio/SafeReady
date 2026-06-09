"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const completeTaskSchema = z.object({
  occurrenceId: z.string(),
  notes: z.string().optional(),
})

export async function getTasks() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) return []

  const tasks = await db.checklistTask.findMany({
    where: { workspaceId: member.workspaceId, active: true },
    include: {
      occurrences: {
        where: { status: "due" },
        orderBy: { dueDate: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    frequency: t.frequency,
    evidenceRequired: t.evidenceRequired,
    notesHint: t.notesHint,
    sourceLabel: t.sourceLabel,
    sourceUrl: t.sourceUrl,
    assigneeId: t.assignedUserId,
    currentOccurrence: t.occurrences[0]
      ? {
          id: t.occurrences[0].id,
          dueDate: t.occurrences[0].dueDate,
          status: t.occurrences[0].status as "due" | "completed",
          completedAt: t.occurrences[0].completedAt,
          completedByName: t.occurrences[0].completedByName,
          notes: t.occurrences[0].notes,
        }
      : null,
  }))
}

export async function getDashboardStats() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
  })
  if (!member) {
    return {
      totalTasks: 0,
      dueCount: 0,
      overdueCount: 0,
      completedCount: 0,
      complianceScore: 0,
      workspaceName: "",
    }
  }

  const now = new Date()
  const occurrences = await db.taskOccurrence.findMany({
    where: { workspaceId: member.workspaceId },
  })

  const due = occurrences.filter((o) => o.status === "due")
  const overdue = due.filter((o) => o.dueDate < now)
  const completed = occurrences.filter((o) => o.status === "completed")

  const completedOnTime = completed.filter(
    (o) => o.completedAt && o.completedAt <= o.dueDate,
  ).length
  const complianceScore =
    completed.length > 0
      ? Math.round((completedOnTime / completed.length) * 100)
      : 100

  return {
    totalTasks: occurrences.length,
    dueCount: due.length,
    overdueCount: overdue.length,
    completedCount: completed.length,
    complianceScore,
    workspaceName: member.workspace.name,
  }
}

interface ActionResult {
  error: string | null
}

export async function completeTask(
  prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { error: "Unauthorized" }

  const parsed = completeTaskSchema.safeParse({
    occurrenceId: formData.get("occurrenceId"),
    notes: formData.get("notes"),
  })
  if (!parsed.success) return { error: "Invalid form data" }

  const occurrence = await db.taskOccurrence.findUnique({
    where: { id: parsed.data.occurrenceId },
    include: { task: true },
  })
  if (!occurrence) return { error: "Occurrence not found" }
  if (occurrence.status === "completed") return { error: "Already completed" }

  const member = await db.workspaceMember.findFirst({
    where: { workspaceId: occurrence.workspaceId, userId: session.user.id },
  })
  if (!member) return { error: "Not a member of this workspace" }

  const { computeNextDueDate } = await import("@/lib/recurrence")
  const now = new Date()

  try {
    await db.$transaction([
      db.taskOccurrence.update({
        where: { id: parsed.data.occurrenceId },
        data: {
          status: "completed",
          completedAt: now,
          completedByUserId: session.user.id,
          completedByName: session.user.name,
          notes: parsed.data.notes ?? null,
        },
      }),
      db.taskOccurrence.create({
        data: {
          workspaceId: occurrence.workspaceId,
          taskId: occurrence.taskId,
          dueDate: computeNextDueDate(now, occurrence.task.frequency as any),
          status: "due",
        },
      }),
      db.auditLog.create({
        data: {
          workspaceId: occurrence.workspaceId,
          actorUserId: session.user.id,
          actionType: "task.completed",
          entityType: "task_occurrence",
          entityId: parsed.data.occurrenceId,
          metadata: { taskTitle: occurrence.task.title },
        },
      }),
    ])
  } catch {
    return { error: "Failed to complete task" }
  }

  revalidatePath("/dashboard")
  revalidatePath("/checklists")
  return { error: null }
}
