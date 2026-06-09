import { getInspectionPack } from "@/actions/inspection-pack"
import { InspectionPackView } from "@/features/inspection-pack/inspection-pack-view"

export default async function InspectionPackPage() {
  const data = await getInspectionPack()

  if (!data || data.completedItems.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Inspection Pack</h1>
          <p className="text-sm text-muted-foreground">
            Printable compliance summary
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete some checklist tasks first to generate an inspection pack.
        </p>
      </div>
    )
  }

  return <InspectionPackView data={data} />
}
