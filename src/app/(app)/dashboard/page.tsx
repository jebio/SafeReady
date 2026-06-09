import { getDashboardStats, getTasks } from "@/actions/checklists"
import { StatsCards } from "@/features/dashboard/stats-cards"
import { ComplianceWidget } from "@/features/dashboard/compliance-widget"
import { TaskList } from "@/features/checklists/task-list"

export default async function DashboardPage() {
  const [stats, tasks] = await Promise.all([getDashboardStats(), getTasks()])

  const sortedTasks = [...tasks].sort((a, b) => {
    const aOcc = a.currentOccurrence
    const bOcc = b.currentOccurrence
    if (!aOcc) return 1
    if (!bOcc) return -1
    const aOverdue = aOcc.status === "due" && new Date(aOcc.dueDate) < new Date()
    const bOverdue = bOcc.status === "due" && new Date(bOcc.dueDate) < new Date()
    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1
    return new Date(aOcc.dueDate).getTime() - new Date(bOcc.dueDate).getTime()
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{stats.workspaceName}</p>
      </div>
      <StatsCards
        dueCount={stats.dueCount}
        overdueCount={stats.overdueCount}
        completedCount={stats.completedCount}
        complianceScore={stats.complianceScore}
      />
      <ComplianceWidget score={stats.complianceScore} />
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <TaskList tasks={sortedTasks} />
      </div>
    </div>
  )
}
