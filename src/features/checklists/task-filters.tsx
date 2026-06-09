"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FREQUENCIES } from "@/lib/constants"

export function TaskFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    const qs = params.toString()
    router.push(qs ? `?${qs}` : "")
  }

  return (
    <div className="flex gap-4">
      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(v) => setParam("status", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="due">Due</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("frequency") ?? "all"}
        onValueChange={(v) => setParam("frequency", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All frequencies" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All frequencies</SelectItem>
          {FREQUENCIES.map((f) => (
            <SelectItem key={f} value={f} className="capitalize">
              {f}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
