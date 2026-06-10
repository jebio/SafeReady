"use client"

import { useActionState, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { FREQUENCIES } from "@/lib/constants"
import { updateTask } from "@/actions/tasks"
import { Pencil } from "lucide-react"
import type { ManageableTask } from "@/actions/tasks"

interface EditTaskDialogProps {
  task: ManageableTask
  members: { id: string; name: string }[]
}

const initialState = { error: null as string | null }

export function EditTaskDialog({ task, members }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(updateTask, initialState)

  useEffect(() => {
    if (state && !state.error) setOpen(false)
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="taskId" value={task.id} />
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={task.title}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={task.description ?? ""}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              defaultValue={task.category ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency *</Label>
            <select
              id="frequency"
              name="frequency"
              required
              defaultValue={task.frequency}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f} className="capitalize">
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notesHint">Notes hint</Label>
            <Input
              id="notesHint"
              name="notesHint"
              defaultValue={task.notesHint ?? ""}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="evidenceRequired"
                name="evidenceRequired"
                defaultChecked={task.evidenceRequired}
              />
              <Label htmlFor="evidenceRequired" className="cursor-pointer">
                Evidence required
              </Label>
            </div>
          </div>

          {members.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="assignedMemberId">Assign to</Label>
              <select
                id="assignedMemberId"
                name="assignedMemberId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" disabled={pending} className="w-full cursor-pointer">
            {pending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
