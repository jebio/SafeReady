"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"

export interface MonthlyCompliance {
  month: string
  label: string
  completed: number
  onTime: number
  percentage: number
}

export interface CategoryMissRate {
  category: string
  total: number
  missed: number
  missRate: number
}

export interface AnalyticsData {
  overallCompliance: number
  totalCompleted: number
  totalOnTime: number
  monthlyTrend: MonthlyCompliance[]
  mostMissedCategories: CategoryMissRate[]
  teamStats: { name: string; completed: number }[]
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) throw new Error("No workspace found")

  const completed = await db.taskOccurrence.findMany({
    where: { workspaceId: member.workspaceId, status: "completed", completedAt: { not: null } },
    include: { task: { select: { category: true } } },
    orderBy: { completedAt: "asc" },
  })

  const totalCompleted = completed.length
  const totalOnTime = completed.filter(
    (o) => o.completedAt && o.completedAt <= o.dueDate,
  ).length
  const overallCompliance =
    totalCompleted > 0 ? Math.round((totalOnTime / totalCompleted) * 100) : 100

  // Monthly trend — last 6 months
  const now = new Date()
  const monthlyTrend: MonthlyCompliance[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1)

    const monthCompleted = completed.filter(
      (o) => o.completedAt! >= d && o.completedAt! < nextMonth,
    )
    const monthOnTime = monthCompleted.filter((o) => o.completedAt! <= o.dueDate)

    monthlyTrend.push({
      month: monthStr,
      label,
      completed: monthCompleted.length,
      onTime: monthOnTime.length,
      percentage:
        monthCompleted.length > 0
          ? Math.round((monthOnTime.length / monthCompleted.length) * 100)
          : 100,
    })
  }

  // Most-missed categories
  const categoryMap = new Map<string, { total: number; missed: number }>()
  for (const o of completed) {
    const cat = o.task.category ?? "Uncategorised"
    const entry = categoryMap.get(cat) ?? { total: 0, missed: 0 }
    entry.total++
    if (o.completedAt! > o.dueDate) entry.missed++
    categoryMap.set(cat, entry)
  }

  const mostMissedCategories: CategoryMissRate[] = [...categoryMap.entries()]
    .map(([category, data]) => ({
      category,
      total: data.total,
      missed: data.missed,
      missRate: Math.round((data.missed / data.total) * 100),
    }))
    .sort((a, b) => b.missRate - a.missRate)

  // Team stats
  const teamMembers = await db.workspaceMember.findMany({
    where: { workspaceId: member.workspaceId },
    include: { user: { select: { name: true } } },
  })

  const teamStats = teamMembers.map((m) => {
    const userCompleted = completed.filter((o) => o.completedByUserId === m.userId)
    return { name: m.user.name, completed: userCompleted.length }
  })

  return {
    overallCompliance,
    totalCompleted,
    totalOnTime,
    monthlyTrend,
    mostMissedCategories,
    teamStats,
  }
}
