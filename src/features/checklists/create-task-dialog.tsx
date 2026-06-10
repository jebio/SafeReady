"use client"

import { useActionState, useState } from "react"
import { useRouter } from "next/navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FREQUENCIES } from "@/lib/constants"
import { createCustomTask } from "@/actions/tasks"
import { Plus } from "lucide-react"

interface CreateTaskDialogProps {
  members: { id: string; name: string }[]
}

const initialState = { error: null as string | null }

export function CreateTaskDialog({ members }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createCustomTask(formData)
      if (!result.error) setOpen(false)
      return result
    },
    initialState,
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create Custom Task</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" placeholder="e.g. Check fire extinguisher" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What does this check involve?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              placeholder="e.g. fire-safety, housekeeping"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency *</Label>
            <select
              id="frequency"
              name="frequency"
              required
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
              placeholder="e.g. Check expiry date"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="evidenceRequired" name="evidenceRequired" />
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
            {pending ? "Creating..." : "Create Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
