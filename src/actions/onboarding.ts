"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { SECTORS } from "@/lib/constants"
import { createNotification } from "@/lib/notifications"

const onboardSchema = z.object({
  workspaceName: z.string().min(1, "Business name is required"),
  sector: z.string().refine((v) => SECTORS.some((s) => s.value === v), "Invalid sector"),
  address: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  templateSlug: z.string().min(1, "Please select a template"),
})

export async function onboardWorkspace(
  prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { error: "Unauthorized" }

  const existing = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (existing) return { error: "You already belong to a workspace" }

  const parsed = onboardSchema.safeParse({
    workspaceName: formData.get("workspaceName"),
    sector: formData.get("sector"),
    address: formData.get("address"),
    contactName: formData.get("contactName"),
    phone: formData.get("phone"),
    templateSlug: formData.get("templateSlug"),
  })
  if (!parsed.success) return { error: "Please fill in all required fields" }

  const { workspaceName, sector, address, contactName, phone, templateSlug } = parsed.data

  const template = await db.systemTemplate.findUnique({
    where: { slug: templateSlug },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  })
  if (!template) return { error: "Template not found" }

  try {
    await db.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          sector,
          address: address ?? null,
          contactName: contactName ?? null,
          contactEmail: session.user.email,
          phone: phone ?? null,
        },
      })

      const member = await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: session.user.id,
          role: "owner",
          joinedAt: new Date(),
        },
      })

      await tx.workspaceTemplate.create({
        data: {
          workspaceId: workspace.id,
          templateId: template.id,
        },
      })

      for (const item of template.items) {
        const task = await tx.checklistTask.create({
          data: {
            workspaceId: workspace.id,
            templateItemId: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            frequency: item.frequency,
            evidenceRequired: item.evidenceRequired,
            notesHint: item.notesHint,
            sourceLabel: item.sourceLabel,
            sourceUrl: item.sourceUrl,
            createdByUserId: session.user.id,
            active: true,
          },
        })

        await tx.taskOccurrence.create({
          data: {
            workspaceId: workspace.id,
            taskId: task.id,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: "due",
          },
        })
      }

      await tx.auditLog.create({
        data: {
          workspaceId: workspace.id,
          actorUserId: session.user.id,
          actionType: "workspace.created",
          entityType: "workspace",
          entityId: workspace.id,
          metadata: {
            workspaceName,
            sector,
            templateName: template.name,
            taskCount: template.items.length,
          },
        },
      })

      await tx.notification.create({
        data: {
          workspaceId: workspace.id,
          type: "workspace.created",
          title: "Workspace created",
          body: `${workspaceName} is ready with ${template.items.length} checklist items.`,
          userId: null,
        },
      })
    })
  } catch {
    return { error: "Failed to create workspace. Please try again." }
  }

  revalidatePath("/dashboard")
  return { error: null }
}
