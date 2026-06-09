export interface TemplateItem {
  title: string
  description?: string
  category?: string
  frequency: string
  evidenceRequired: boolean
  notesHint?: string
  sourceLabel?: string
  sourceUrl?: string
  sortOrder: number
}

export interface TemplateSeed {
  name: string
  slug: string
  sector: string
  items: TemplateItem[]
}
