"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Clock, Target } from "lucide-react"

interface StatsCardsProps {
  dueCount: number
  overdueCount: number
  completedCount: number
  complianceScore: number
}

export function StatsCards({
  dueCount,
  overdueCount,
  completedCount,
  complianceScore,
}: StatsCardsProps) {
  const stats = [
    { label: "Due", value: dueCount, icon: Clock },
    { label: "Overdue", value: overdueCount, icon: AlertCircle },
    { label: "Completed", value: completedCount, icon: CheckCircle2 },
    { label: "Compliance", value: `${complianceScore}%`, icon: Target },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
