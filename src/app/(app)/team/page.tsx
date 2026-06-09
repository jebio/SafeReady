import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { TeamPageClient } from "@/features/team/client"

export default async function TeamPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) redirect("/onboarding")

  const members = await db.workspaceMember.findMany({
    where: { workspaceId: member.workspaceId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  })

  const invitations = await db.invitation.findMany({
    where: { workspaceId: member.workspaceId, usedAt: null },
    orderBy: { createdAt: "desc" },
  })

  return (
    <TeamPageClient
      currentUserId={session.user.id}
      currentRole={member.role}
      initialMembers={members.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        joinedAt: m.joinedAt,
      }))}
      initialInvitations={invitations.map((i) => ({
        id: i.id,
        email: i.email,
        role: i.role,
        expiresAt: i.expiresAt,
        createdAt: i.createdAt,
      }))}
    />
  )
}
