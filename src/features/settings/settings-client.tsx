"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { History, Info, UserCheck, UserPlus, Trash2, FileText } from "lucide-react"
import type { AuditLogEntry } from "@/actions/settings"

interface SettingsClientProps {
  data: {
    workspace: {
      id: string
      name: string
      sector: string | null
      address: string | null
      contactName: string | null
      contactEmail: string | null
      phone: string | null
    }
    role: string
  }
  auditLog: AuditLogEntry[]
}

const actionLabels: Record<string, { label: string; icon: React.ElementType }> = {
  "task.completed": { label: "Task completed", icon: FileText },
  "workspace.created": { label: "Workspace created", icon: Info },
  "member.joined": { label: "Member joined", icon: UserCheck },
  "member.added": { label: "Member added", icon: UserPlus },
  "member.removed": { label: "Member removed", icon: Trash2 },
  "invitation.sent": { label: "Invitation sent", icon: UserPlus },
}

export function SettingsClient({ data, auditLog }: SettingsClientProps) {
  const { workspace, role } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Workspace details and activity log
        </p>
      </div>

      {/* Workspace details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className="font-medium">Name:</span> {workspace.name}
          </div>
          <div>
            <span className="font-medium">Your role:</span>{" "}
            <span className="capitalize">{role}</span>
          </div>
          {workspace.sector && (
            <div>
              <span className="font-medium">Sector:</span>{" "}
              <span className="capitalize">{workspace.sector}</span>
            </div>
          )}
          {workspace.contactEmail && (
            <div>
              <span className="font-medium">Contact email:</span> {workspace.contactEmail}
            </div>
          )}
          {workspace.contactName && (
            <div>
              <span className="font-medium">Contact name:</span> {workspace.contactName}
            </div>
          )}
          {workspace.phone && (
            <div>
              <span className="font-medium">Phone:</span> {workspace.phone}
            </div>
          )}
          {workspace.address && (
            <div className="sm:col-span-2">
              <span className="font-medium">Address:</span> {workspace.address}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {auditLog.map((entry) => {
                const action = actionLabels[entry.actionType] ?? {
                  label: entry.actionType.replace(/\./g, " "),
                  icon: Info,
                }
                const Icon = action.icon
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="font-medium">{action.label}</span>
                      {entry.actorName && (
                        <span className="text-muted-foreground">
                          {" "}by {entry.actorName}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
