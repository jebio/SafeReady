import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react"
import type { TaskWithOccurrence } from "@/lib/types"

interface TaskCardProps {
  task: TaskWithOccurrence
}

export function TaskCard({ task }: TaskCardProps) {
  const occ = task.currentOccurrence
  const isOverdue = occ && occ.status === "due" && new Date(occ.dueDate) < new Date()
  const statusColor = occ?.status === "completed" ? "secondary" : isOverdue ? "destructive" : "default"
  const StatusIcon = occ?.status === "completed" ? CheckCircle2 : isOverdue ? AlertCircle : Clock

  return (
    <Link href={`/checklists/${task.id}`}>
      <Card className="cursor-pointer transition-colors hover:bg-accent/50">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate text-base">{task.title}</CardTitle>
            {task.description && (
              <p className="line-clamp-1 text-sm text-muted-foreground">{task.description}</p>
            )}
          </div>
          <Badge variant={statusColor} className="shrink-0">
            {isOverdue ? "Overdue" : occ?.status ?? "No occurrence"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {occ && (
              <span className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {formatDate(occ.dueDate)}
              </span>
            )}
            <span className="capitalize">{task.frequency}</span>
            {task.category && <span className="capitalize">{task.category.replace(/-/g, " ")}</span>}
            {task.evidenceRequired && <FileText className="h-3 w-3" />}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
