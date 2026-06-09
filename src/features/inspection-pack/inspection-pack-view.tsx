"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Printer } from "lucide-react"
import type { InspectionPackData } from "@/actions/inspection-pack"
import { useRouter } from "next/navigation"

interface InspectionPackViewProps {
  data: InspectionPackData
}

export function InspectionPackView({ data }: InspectionPackViewProps) {
  const router = useRouter()

  const handlePrint = () => {
    window.print()
  }

  const {
    workspaceName,
    sector,
    address,
    contactName,
    contactEmail,
    phone,
    summary,
    completedItems,
  } = data

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Controls — hidden when printing */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Inspection Pack</h1>
          <p className="text-sm text-muted-foreground">
            Printable compliance summary
          </p>
        </div>
        <Button onClick={handlePrint} className="cursor-pointer">
          <Printer className="mr-2 h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>

      {/* Header — always visible */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold">{workspaceName}</h1>
        <p className="text-sm text-muted-foreground">
          Inspection Pack &mdash; Generated {formatDate(new Date(data.generatedAt))}
        </p>
      </div>

      {/* Business details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Business Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          {contactName && <div><span className="font-medium">Contact:</span> {contactName}</div>}
          {contactEmail && <div><span className="font-medium">Email:</span> {contactEmail}</div>}
          {phone && <div><span className="font-medium">Phone:</span> {phone}</div>}
          {sector && <div><span className="font-medium">Sector:</span> <span className="capitalize">{sector}</span></div>}
          {address && (
            <div className="sm:col-span-2">
              <span className="font-medium">Address:</span> {address}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Compliance Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-4">
          <div>
            <p className="text-lg font-bold">{summary.totalTasks}</p>
            <p className="text-xs text-muted-foreground">Total checks</p>
          </div>
          <div>
            <p className="text-lg font-bold">{summary.completedOnTime}</p>
            <p className="text-xs text-muted-foreground">Completed on time</p>
          </div>
          <div>
            <p className="text-lg font-bold">{summary.overdueCount}</p>
            <p className="text-xs text-muted-foreground">Currently overdue</p>
          </div>
          <div>
            <p className="text-lg font-bold">{summary.complianceScore}%</p>
            <p className="text-xs text-muted-foreground">Compliance score</p>
          </div>
        </CardContent>
      </Card>

      {/* Completed items */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Completed Checklist Items ({completedItems.length})</h2>
        {completedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items have been completed yet.</p>
        ) : (
          <div className="space-y-2">
            {completedItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="py-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.taskTitle}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Completed {formatDate(item.completedAt)}</span>
                        {item.completedByName && (
                          <span>by {item.completedByName}</span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.category && (
                        <Badge variant="secondary" className="capitalize text-xs">
                          {item.category.replace(/-/g, " ")}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.frequency}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t pt-4 text-center text-xs text-muted-foreground print:pt-2">
        <p>SafeReady &mdash; Safety compliance for UK small businesses</p>
        <p>
          This pack contains {completedItems.length} completed checks across{" "}
          {summary.totalTasks} total tasks.
        </p>
        <p className="mt-1 text-[10px]">
          This document is a summary of compliance activities and does not constitute legal advice.
          Businesses should seek professional guidance on their specific legal obligations.
        </p>
      </div>
    </div>
  )
}
