"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ComplianceWidgetProps {
  score: number
}

export function ComplianceWidget({ score }: ComplianceWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">On-Time Compliance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={score} />
        <p className="text-2xl font-bold">{score}%</p>
        <p className="text-xs text-muted-foreground">
          of completed tasks were done on time
        </p>
      </CardContent>
    </Card>
  )
}
