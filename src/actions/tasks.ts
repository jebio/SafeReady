"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { computeNextDueDate } from "@/lib/recurrence"
import type { Frequency } from "@/lib/constants"

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v)

interface ActionResult {
  error: string | null
}

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.preprocess(emptyToUndefined, z.string().max(500).optional()),
  category: z.preprocess(emptyToUndefined, z.string().max(100).optional()),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
  evidenceRequired: z.coerce.boolean().optional().default(false),
  notesHint: z.preprocess(emptyToUndefined, z.string().max(300).optional()),
  assignedMemberId: z.preprocess(emptyToUndefined, z.string().optional()),
})

const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.preprocess(emptyToUndefined, z.string().max(500).optional()),
  category: z.preprocess(emptyToUndefined, z.string().max(100).optional()),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
  evidenceRequired: z.coerce.boolean().optional().default(false),
  notesHint: z.preprocess(emptyToUndefined, z.string().max(300).optional()),
  assignedMemberId: z.preprocess(emptyToUndefined, z.string().optional()),
})

export interface ManageableTask {
  id: string
  title: string
  description: string | null
  category: string | null
  frequency: string
  evidenceRequired: boolean
  notesHint: string | null
  active: boolean
  createdAt: Date
  occurrenceCount: number
  lastCompletedAt: Date | null
  assignedMemberName: string | null
}

export async function getManageableTasks(): Promise<ManageableTask[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id, role: "owner" },
  })
  if (!member) throw new Error("Not authorized")

  const tasks = await db.checklistTask.findMany({
    where: { workspaceId: member.workspaceId },
    include: {
      _count: { select: { occurrences: true } },
      occurrences: {
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 1,
        select: { completedAt: true },
      },
      assignedUser: { select: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "asc" },
  })

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    notesHint: t.notesHint,
    frequency: t.frequency,
    evidenceRequired: t.evidenceRequired,
    active: t.active,
    createdAt: t.createdAt,
    occurrenceCount: t._count.occurrences,
    lastCompletedAt: t.occurrences[0]?.completedAt ?? null,
    assignedMemberName: t.assignedUser?.user?.name ?? null,
  }))
}

export async function createCustomTask(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { error: "Unauthorized" }

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id, role: "owner" },
  })
  if (!member) return { error: "Not authorized" }

  const parsed = createTaskSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: "Invalid form data" }

  const { computeNextDueDate } = await import("@/lib/recurrence")
  const now = new Date()

  try {
    await db.$transaction(async (tx) => {
      const task = await tx.checklistTask.create({
        data: {
          workspaceId: member.workspaceId,
          title: parsed.data.title,
          description: parsed.data.description ?? null,
          category: parsed.data.category ?? null,
          frequency: parsed.data.frequency,
          evidenceRequired: parsed.data.evidenceRequired,
          notesHint: parsed.data.notesHint ?? null,
          assignedUserId: parsed.data.assignedMemberId ?? null,
          createdByUserId: session.user.id,
          active: true,
        },
      })

      await tx.taskOccurrence.create({
        data: {
          workspaceId: member.workspaceId,
          taskId: task.id,
          dueDate: computeNextDueDate(now, parsed.data.frequency),
          status: "due",
        },
      })

      await tx.auditLog.create({
        data: {
          workspaceId: member.workspaceId,
          actorUserId: session.user.id,
          actionType: "task.created",
          entityType: "checklist_task",
          entityId: task.id,
          metadata: { title: parsed.data.title },
        },
      })

      await tx.notification.create({
        data: {
          workspaceId: member.workspaceId,
          type: "task.created",
          title: `New task created: "${parsed.data.title}"`,
          userId: null,
        },
      })
    })
  } catch {
    return { error: "Failed to create task" }
  }

  revalidatePath("/checklists/manage")
  revalidatePath("/checklists")
  revalidatePath("/dashboard")
  return { error: null }
}

export async function updateTask(prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { error: "Unauthorized" }

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id, role: "owner" },
  })
  if (!member) return { error: "Not authorized" }

  const taskId = formData.get("taskId") as string
  if (!taskId) return { error: "Missing task ID" }

  const parsed = updateTaskSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: "Invalid form data" }

  try {
    await db.$transaction(async (tx) => {
      const task = await tx.checklistTask.update({
        where: { id: taskId, workspaceId: member.workspaceId },
        data: {
          title: parsed.data.title,
          description: parsed.data.description ?? null,
          category: parsed.data.category ?? null,
          frequency: parsed.data.frequency,
          evidenceRequired: parsed.data.evidenceRequired,
          notesHint: parsed.data.notesHint ?? null,
          assignedUserId: parsed.data.assignedMemberId ?? null,
        },
      })

      await tx.auditLog.create({
        data: {
          workspaceId: member.workspaceId,
          actorUserId: session.user.id,
          actionType: "task.updated",
          entityType: "checklist_task",
          entityId: task.id,
          metadata: { title: parsed.data.title },
        },
      })
    })
  } catch (e) {
    console.error("Failed to update task:", e)
    return { error: "Failed to update task" }
  }

  revalidatePath("/checklists/manage")
  revalidatePath("/checklists")
  revalidatePath("/dashboard")
  return { error: null }
}

export async function deleteChecklistTask(taskId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { error: "Unauthorized" }

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id, role: "owner" },
  })
  if (!member) return { error: "Not authorized" }

  try {
    await db.$transaction(async (tx) => {
      const task = await tx.checklistTask.findUnique({
        where: { id: taskId, workspaceId: member.workspaceId },
      })
      if (!task) throw new Error("Task not found")

      // Cancel all due occurrences
      await tx.taskOccurrence.updateMany({
        where: { taskId, status: "due" },
        data: { status: "completed", completedAt: null, completedByName: "Task archived" },
      })

      // Soft-delete the task
      await tx.checklistTask.update({
        where: { id: taskId },
        data: { active: false },
      })

      await tx.auditLog.create({
        data: {
          workspaceId: member.workspaceId,
          actorUserId: session.user.id,
          actionType: "task.deleted",
          entityType: "checklist_task",
          entityId: taskId,
          metadata: { title: task.title },
        },
      })
    })
  } catch {
    return { error: "Failed to delete task" }
  }

  revalidatePath("/checklists/manage")
  revalidatePath("/checklists")
  revalidatePath("/dashboard")
  return { error: null }
}
