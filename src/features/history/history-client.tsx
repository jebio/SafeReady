"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import { FileText, CheckCircle2 } from "lucide-react"
import type { HistoryItem } from "@/actions/history"

interface HistoryClientProps {
  initialItems: HistoryItem[]
  categories: string[]
  members: { id: string; name: string }[]
  filters: {
    from?: string
    to?: string
    category?: string
    completedBy?: string
  }
}

export function HistoryClient({
  initialItems,
  categories,
  members,
  filters,
}: HistoryClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/history?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            type="date"
            defaultValue={filters.from ?? ""}
            onChange={(e) => setFilter("from", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            type="date"
            defaultValue={filters.to ?? ""}
            onChange={(e) => setFilter("to", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={filters.category ?? "all"}
            onValueChange={(v) => setFilter("category", v === "all" ? "" : v)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat.replace(/-/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="completedBy">Completed By</Label>
          <Select
            value={filters.completedBy ?? "all"}
            onValueChange={(v) => setFilter("completedBy", v === "all" ? "" : v)}
          >
            <SelectTrigger id="completedBy">
              <SelectValue placeholder="Anyone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Anyone</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {initialItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No completed tasks found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {initialItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{item.taskTitle}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.completedAt)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      by {item.completedByName ?? "Unknown"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.taskCategory && (
                    <Badge variant="secondary" className="capitalize text-xs">
                      {item.taskCategory.replace(/-/g, " ")}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs capitalize">
                    {item.taskFrequency}
                  </Badge>
                  {item.evidenceCount > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      {item.evidenceCount}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
