import { db } from "@/lib/db"
import { officeTemplate } from "../seed/templates/office"
import { salonTemplate } from "../seed/templates/salon"
import { workshopTemplate } from "../seed/templates/workshop"
import { retailTemplate } from "../seed/templates/retail"
import { seedDemoWorkspace } from "../seed/demo-data"
import { seedDemoAccounts } from "../seed/demo-accounts"

async function seedTemplates() {
  const templates = [officeTemplate, salonTemplate, workshopTemplate, retailTemplate]

  for (const t of templates) {
    const existing = await db.systemTemplate.findUnique({ where: { slug: t.slug } })
    if (existing) {
      console.log(`Template "${t.name}" already exists, skipping.`)
      continue
    }

    const template = await db.systemTemplate.create({
      data: {
        name: t.name,
        slug: t.slug,
        sector: t.sector,
        items: {
          create: t.items.map((item) => ({
            title: item.title,
            description: item.description || null,
            category: item.category || null,
            frequency: item.frequency,
            evidenceRequired: item.evidenceRequired,
            notesHint: item.notesHint || null,
            sourceLabel: item.sourceLabel || null,
            sourceUrl: item.sourceUrl || null,
            sortOrder: item.sortOrder,
          })),
        },
      },
    })

    console.log(`Seeded template "${template.name}" with ${t.items.length} items.`)
  }
}

async function main() {
  console.log("Seeding system templates...")
  await seedTemplates()
  console.log("Seeding demo workspace...")
  await seedDemoWorkspace()
  console.log("Seeding demo accounts...")
  await seedDemoAccounts()
  console.log("Seed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
