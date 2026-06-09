import { getTasks } from "@/actions/checklists"
import { TaskList } from "@/features/checklists/task-list"
import { TaskFilters } from "@/features/checklists/task-filters"

interface ChecklistsPageProps {
  searchParams: Promise<{ status?: string; category?: string; frequency?: string }>
}

export default async function ChecklistsPage({ searchParams }: ChecklistsPageProps) {
  const params = await searchParams
  const tasks = await getTasks()

  let filtered = tasks
  if (params.status && params.status !== "all") {
    if (params.status === "overdue") {
      filtered = filtered.filter(
        (t) =>
          t.currentOccurrence?.status === "due" &&
          new Date(t.currentOccurrence.dueDate) < new Date(),
      )
    } else if (params.status === "completed") {
      filtered = filtered.filter((t) => t.currentOccurrence?.status === "completed")
    } else {
      filtered = filtered.filter((t) => t.currentOccurrence?.status === params.status)
    }
  }
  if (params.frequency && params.frequency !== "all") {
    filtered = filtered.filter((t) => t.frequency === params.frequency)
  }
  if (params.category && params.category !== "all") {
    filtered = filtered.filter((t) => t.category === params.category)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Checklists</h1>
        <p className="text-sm text-muted-foreground">
          View and complete your safety checks
        </p>
      </div>
      <TaskFilters />
      <TaskList tasks={filtered} />
    </div>
  )
}
