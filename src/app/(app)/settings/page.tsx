import { getWorkspaceSettings, getAuditLog } from "@/actions/settings"
import { SettingsClient } from "@/features/settings/settings-client"

export default async function SettingsPage() {
  const [data, auditLog] = await Promise.all([
    getWorkspaceSettings(),
    getAuditLog(),
  ])

  return <SettingsClient data={data} auditLog={auditLog} />
}
