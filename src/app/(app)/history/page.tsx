import { getHistory, getTeamMembers } from "@/actions/history"
import { HistoryClient } from "@/features/history/history-client"

interface HistoryPageProps {
  searchParams: Promise<{
    from?: string
    to?: string
    category?: string
    completedBy?: string
  }>
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams
  const { items, categories } = await getHistory(params)
  const members = await getTeamMembers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-sm text-muted-foreground">
          Completed tasks and compliance records
        </p>
      </div>
      <HistoryClient
        initialItems={items}
        categories={categories}
        members={members}
        filters={params}
      />
    </div>
  )
}
