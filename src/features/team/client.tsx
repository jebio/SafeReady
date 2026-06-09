"use client"

import { useActionState, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MemberList,
  InviteForm,
  PendingInvites,
} from "@/features/team/team-management"
import { inviteMember, removeMember, cancelInvitation } from "@/actions/team"

interface TeamPageClientProps {
  currentUserId: string
  currentRole: string
  initialMembers: {
    id: string
    userId: string
    name: string
    email: string
    role: string
    joinedAt: Date | null
  }[]
  initialInvitations: {
    id: string
    email: string
    role: string
    expiresAt: Date
    createdAt: Date
  }[]
}

export function TeamPageClient({
  currentUserId,
  currentRole,
  initialMembers,
  initialInvitations,
}: TeamPageClientProps) {
  const [members, setMembers] = useState(initialMembers)
  const [invitations, setInvitations] = useState(initialInvitations)
  const [inviteState, inviteAction, invitePending] = useActionState(
    inviteMember,
    { error: null },
  )

  const handleRemove = async (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    if (!member) return
    if (!window.confirm(`Remove ${member.name} from the workspace? They will lose access to all data.`)) return

    const fd = new FormData()
    fd.set("memberId", memberId)
    const result = await removeMember({ error: null }, fd)
    if (!result.error) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
    }
  }

  const handleCancel = async (inviteId: string) => {
    const fd = new FormData()
    fd.set("inviteId", inviteId)
    const result = await cancelInvitation({ error: null }, fd)
    if (!result.error) {
      setInvitations((prev) => prev.filter((i) => i.id !== inviteId))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-sm text-muted-foreground">
          Manage your team members and invitations.
        </p>
      </div>

      {currentRole === "owner" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite a team member</CardTitle>
          </CardHeader>
          <CardContent>
            <InviteForm
              onInvite={inviteAction}
              error={inviteState?.error ?? null}
              pending={invitePending}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Team members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MemberList
            members={members}
            currentUserId={currentUserId}
            currentRole={currentRole}
            onRemove={handleRemove}
          />
        </CardContent>
      </Card>

      {currentRole === "owner" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Pending invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PendingInvites invitations={invitations} onCancel={handleCancel} />
            {invitations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No pending invitations.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
