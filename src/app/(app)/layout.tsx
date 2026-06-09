import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  // Unread notification count for the header bell
  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })

  let unreadCount = 0
  if (member) {
    unreadCount = await db.notification.count({
      where: {
        workspaceId: member.workspaceId,
        OR: [{ userId: session.user.id }, { userId: null }],
        readAt: null,
      },
    })
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader user={session.user} unreadCount={unreadCount} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
