"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateTaskDialog } from "@/features/checklists/create-task-dialog"
import { EditTaskDialog } from "@/features/checklists/edit-task-dialog"
import { deleteChecklistTask } from "@/actions/tasks"
import { formatDate } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import type { ManageableTask } from "@/actions/tasks"

interface TaskManagerProps {
  tasks: ManageableTask[]
  members: { id: string; name: string }[]
}

export function TaskManager({ tasks, members }: TaskManagerProps) {
  const [taskList, setTaskList] = useState(tasks)

  const handleDelete = async (taskId: string) => {
    const task = taskList.find((t) => t.id === taskId)
    if (!task) return
    if (
      !window.confirm(
        `Remove "${task.title}"? This will archive the task and cancel all due checks. Completed history will be preserved.`,
      )
    )
      return

    const result = await deleteChecklistTask(taskId)
    if (!result.error) {
      setTaskList((prev) => prev.filter((t) => t.id !== taskId))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {taskList.length} task{taskList.length !== 1 ? "s" : ""} in total
          </p>
        </div>
        <CreateTaskDialog members={members} />
      </div>

      <div className="space-y-3">
        {taskList.map((task) => (
          <Card key={task.id} className={task.active ? "" : "opacity-50"}>
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{task.title}</span>
                  <Badge variant="outline" className="capitalize text-xs">
                    {task.frequency}
                  </Badge>
                  {task.category && (
                    <Badge variant="secondary" className="capitalize text-xs">
                      {task.category.replace(/-/g, " ")}
                    </Badge>
                  )}
                  {task.evidenceRequired && (
                    <Badge variant="outline" className="text-xs">
                      Evidence
                    </Badge>
                  )}
                  {!task.active && <Badge className="text-xs">Archived</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {task.occurrenceCount} occurrence{task.occurrenceCount !== 1 ? "s" : ""}
                  {task.lastCompletedAt && <> &middot; Last completed {formatDate(task.lastCompletedAt)}</>}
                  {task.assignedMemberName && <> &middot; Assigned to {task.assignedMemberName}</>}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {task.active && (
                  <>
                    <EditTaskDialog task={task} members={members} />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {taskList.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No tasks yet. Create your first custom task to get started.
          </p>
        )}
      </div>
    </div>
  )
}
