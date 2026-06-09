"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, AlertTriangle, Users } from "lucide-react"
import type { AnalyticsData } from "@/actions/analytics"

interface AnalyticsClientProps {
  data: AnalyticsData
}

export function AnalyticsClient({ data }: AnalyticsClientProps) {
  const { overallCompliance, totalCompleted, totalOnTime, monthlyTrend, mostMissedCategories, teamStats } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Compliance insights and trends
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallCompliance}%</div>
            <p className="text-xs text-muted-foreground">overall on-time rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompleted}</div>
            <p className="text-xs text-muted-foreground">{totalOnTime} completed on time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Missed Categories</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostMissedCategories.filter((c) => c.missRate > 20).length}
            </div>
            <p className="text-xs text-muted-foreground">
              categories with &gt;20% miss rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.length}</div>
            <p className="text-xs text-muted-foreground">active members</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Compliance Trend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {monthlyTrend.map((m) => (
            <div key={m.month} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{m.label}</span>
                <span className="text-muted-foreground">
                  {m.onTime}/{m.completed} on time ({m.percentage}%)
                </span>
              </div>
              <Progress value={m.percentage} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Most-missed categories */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most-Missed Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {mostMissedCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-3">
                {mostMissedCategories.slice(0, 8).map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">
                        {cat.category.replace(/-/g, " ")}
                      </span>
                      <span className="text-muted-foreground">
                        {cat.missed}/{cat.total} missed ({cat.missRate}%)
                      </span>
                    </div>
                    <Progress
                      value={cat.missRate}
                      className={
                        cat.missRate > 50
                          ? "[&>div]:bg-destructive"
                          : cat.missRate > 20
                            ? "[&>div]:bg-amber-500"
                            : ""
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Completion Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {teamStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-3">
                {teamStats.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{member.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {member.completed} completed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
