import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { getManageableTasks } from "@/actions/tasks"
import { TaskManager } from "@/features/checklists/task-manager"
import { redirect } from "next/navigation"

export default async function ManageTasksPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id, role: "owner" },
  })
  if (!member) redirect("/dashboard")

  const [tasks, workspaceMembers] = await Promise.all([
    getManageableTasks(),
    db.workspaceMember.findMany({
      where: { workspaceId: member.workspaceId },
      include: { user: { select: { name: true, email: true } } },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Create, edit and remove checklist tasks for your workspace.
        </p>
      </div>

      <TaskManager
        tasks={tasks}
        members={workspaceMembers.map((m) => ({
          id: m.id,
          name: m.user.name,
        }))}
      />
    </div>
  )
}
