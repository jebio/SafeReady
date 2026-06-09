import { db } from "@/lib/db"
import { OnboardingWizard } from "@/features/onboarding/onboarding-wizard"

export default async function OnboardingPage() {
  const templates = await db.systemTemplate.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { name: "asc" },
  })

  return (
    <OnboardingWizard
      templates={templates.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        sector: t.sector,
        _count: t._count,
      }))}
    />
  )
}
