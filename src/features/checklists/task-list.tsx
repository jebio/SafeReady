import { ClipboardCheck } from "lucide-react"
import { TaskCard } from "./task-card"
import type { TaskWithOccurrence } from "@/lib/types"

interface TaskListProps {
  tasks: TaskWithOccurrence[]
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">No tasks found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
