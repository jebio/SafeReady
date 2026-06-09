export const FREQUENCIES = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
] as const

export type Frequency = (typeof FREQUENCIES)[number]

export const SECTORS = [
  { value: "office", label: "Small Office" },
  { value: "salon", label: "Salon / Clinic" },
  { value: "workshop", label: "Workshop / Trades" },
  { value: "retail", label: "Retail" },
] as const

export const ROLES = ["owner", "staff"] as const

export const OCCURRENCE_STATUSES = ["due", "completed"] as const

export const frequencies = FREQUENCIES
