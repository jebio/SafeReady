"use client"

import { useActionState } from "react"
import { completeTask } from "@/actions/checklists"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CompleteTaskFormProps {
  occurrenceId: string
  evidenceRequired: boolean
  notesHint: string | null
}

const initialState = { error: null as string | null }

export function CompleteTaskForm({
  occurrenceId,
  evidenceRequired,
  notesHint,
}: CompleteTaskFormProps) {
  const [state, formAction, pending] = useActionState(completeTask, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="occurrenceId" value={occurrenceId} />

      <div className="space-y-2">
        <Label htmlFor="notes">Completion Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder={notesHint ?? "Add any notes about this check..."}
          rows={3}
        />
      </div>

      {evidenceRequired && (
        <p className="text-sm text-muted-foreground">
          Evidence is required for this task. Upload files after completing.
        </p>
      )}

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Completing..." : "Mark as Complete"}
      </Button>
    </form>
  )
}
