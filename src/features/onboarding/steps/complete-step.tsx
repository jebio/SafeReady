import { CheckCircle2, ClipboardCheck, Building2, Users } from "lucide-react"

interface CompleteStepProps {
  workspaceName: string
  templateName: string
  taskCount: number
}

export function CompleteStep({ workspaceName, templateName, taskCount }: CompleteStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <CheckCircle2 className="h-12 w-12 text-accent" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">You're all set!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your workspace is ready to go.
        </p>
      </div>
      <div className="space-y-3 rounded-lg border p-4 text-left">
        <div className="flex items-center gap-3">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{workspaceName}</span>
        </div>
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {templateName} — {taskCount} tasks
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">You can invite team members from Settings</span>
        </div>
      </div>
    </div>
  )
}
