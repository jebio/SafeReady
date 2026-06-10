import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { CompleteTaskForm } from "@/features/checklists/complete-task-form"
import { EvidenceSection } from "@/features/evidence/evidence-section"
import { ArrowLeft, ExternalLink } from "lucide-react"

interface TaskDetailPageProps {
  params: Promise<{ taskId: string }>
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return notFound()

  const task = await db.checklistTask.findUnique({
    where: { id: taskId },
    include: {
      occurrences: {
        orderBy: { dueDate: "desc" },
        take: 5,
        include: {
          evidenceFiles: true,
          completedBy: { select: { name: true } },
        },
      },
    },
  })

  if (!task) return notFound()

  const currentOccurrence = task.occurrences.find((o) => o.status === "due")
  const history = task.occurrences.filter((o) => o.status === "completed")

  return (
    <div className="space-y-6">
      <Link
        href="/checklists"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to checklists
      </Link>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <Badge variant="outline" className="capitalize">
            {task.frequency}
          </Badge>
          {task.category && (
            <Badge variant="secondary" className="capitalize">
              {task.category.replace(/-/g, " ")}
            </Badge>
          )}
        </div>
        {task.description && <p className="text-muted-foreground">{task.description}</p>}
        {task.sourceUrl && (
          <a
            href={task.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary"
          >
            <ExternalLink className="h-3 w-3" /> {task.sourceLabel ?? "Source"}
          </a>
        )}
      </div>

      {currentOccurrence && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Complete This Check</CardTitle>
            </CardHeader>
            <CardContent>
              <CompleteTaskForm
                occurrenceId={currentOccurrence.id}
                evidenceRequired={task.evidenceRequired}
                notesHint={task.notesHint}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evidence Files</CardTitle>
            </CardHeader>
            <CardContent>
              <EvidenceSection
                occurrenceId={currentOccurrence.id}
                files={currentOccurrence.evidenceFiles.map((f) => ({
                  ...f,
                  uploadedBy: null,
                  uploadedAt: f.uploadedAt,
                }))}
              />
            </CardContent>
          </Card>
        </>
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Completions</h2>
          {history.map((occ) => (
            <Card key={occ.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Completed {formatDate(occ.completedAt!)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {occ.completedByName ?? "Unknown"}
                  </p>
                </div>
                {occ.notes && (
                  <p className="max-w-sm text-right text-xs text-muted-foreground">
                    {occ.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
