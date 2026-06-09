export type OccurrenceStatus = "due" | "completed"

export interface CurrentOccurrence {
  id: string
  dueDate: Date
  status: OccurrenceStatus
  completedAt: Date | null
  completedByName: string | null
  notes: string | null
}

export interface TaskWithOccurrence {
  id: string
  title: string
  description: string | null
  category: string | null
  frequency: string
  evidenceRequired: boolean
  notesHint: string | null
  sourceLabel: string | null
  sourceUrl: string | null
  assigneeId: string | null
  currentOccurrence: CurrentOccurrence | null
}
