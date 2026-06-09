import { db } from "@/lib/db"
import { addDays, addMonths, startOfDay } from "date-fns"

export async function seedDemoWorkspace() {
  const existing = await db.workspace.findFirst({ where: { name: "Demo Salon" } })
  if (existing) {
    console.log("Demo workspace already exists, skipping.")
    return
  }

  const workspace = await db.workspace.create({
    data: {
      name: "Demo Salon",
      sector: "salon",
      contactName: "Alex Demo",
      contactEmail: "demo@safeready.app",
    },
  })

  const template = await db.systemTemplate.findFirst({ where: { slug: "salon-clinic" } })
  if (!template) {
    console.log("No salon template found, skipping demo workspace tasks.")
    return
  }

  // Enable the template
  await db.workspaceTemplate.create({
    data: {
      workspaceId: workspace.id,
      templateId: template.id,
    },
  })

  // Create tasks from template items
  const templateItems = await db.systemTemplateItem.findMany({
    where: { templateId: template.id },
    orderBy: { sortOrder: "asc" },
  })

  let completedCount = 0
  for (const item of templateItems) {
    const task = await db.checklistTask.create({
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
        createdByUserId: "seed",
        active: true,
      },
    })

    // Create past completed occurrences for some items
    if (completedCount < 4) {
      const completedDate = addDays(startOfDay(new Date()), -Math.floor(Math.random() * 7) - 1)
      await db.taskOccurrence.create({
        data: {
          workspaceId: workspace.id,
          taskId: task.id,
          dueDate: completedDate,
          status: "completed",
          completedAt: completedDate,
          completedByName: "Alex Demo",
          notes: "Completed as part of routine checks.",
        },
      })
      completedCount++
    }

    // Create upcoming due occurrence
    await db.taskOccurrence.create({
      data: {
        workspaceId: workspace.id,
        taskId: task.id,
        dueDate: addDays(new Date(), 1),
        status: "due",
      },
    })
  }

  // Create a staff invitation
  await db.invitation.create({
    data: {
      email: "staff@demo.safeready.app",
      workspaceId: workspace.id,
      token: "demo-invite-token",
      role: "staff",
      expiresAt: addMonths(new Date(), 1),
    },
  })

  console.log(`Seeded demo workspace "${workspace.name}" with ${templateItems.length} tasks.`)
  console.log("Demo invite token: demo-invite-token (for staff@demo.safeready.app)")
}
