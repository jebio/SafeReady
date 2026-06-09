import { addDays, addWeeks, addMonths, addYears } from "date-fns"
import type { Frequency } from "./constants"

export function computeNextDueDate(from: Date, frequency: Frequency): Date {
  switch (frequency) {
    case "daily":
      return addDays(from, 1)
    case "weekly":
      return addWeeks(from, 1)
    case "monthly":
      return addMonths(from, 1)
    case "quarterly":
      return addMonths(from, 3)
    case "yearly":
      return addYears(from, 1)
  }
}
