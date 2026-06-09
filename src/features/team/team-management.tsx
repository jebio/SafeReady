"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { inviteMember } from "@/actions/team"
import { X } from "lucide-react"

interface MemberListProps {
  members: {
    id: string
    userId: string
    name: string
    email: string
    role: string
    joinedAt: Date | null
  }[]
  currentUserId: string
  currentRole: string
  onRemove: (memberId: string) => void
}

export function MemberList({
  members,
  currentUserId,
  currentRole,
  onRemove,
}: MemberListProps) {
  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div>
            <p className="text-sm font-medium">
              {member.name}
              {member.userId === currentUserId && (
                <span className="ml-2 text-xs text-muted-foreground">(you)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{member.email}</p>
            <p className="text-xs capitalize text-muted-foreground">{member.role}</p>
          </div>
          {currentRole === "owner" && member.userId !== currentUserId && (
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer text-destructive hover:text-destructive"
              onClick={() => onRemove(member.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

interface InviteFormProps {
  onInvite: (formData: FormData) => void
  error: string | null
  pending: boolean
}

export function InviteForm({ onInvite, error, pending }: InviteFormProps) {
  return (
    <form action={onInvite} className="flex items-end gap-2">
      <div className="flex-1 space-y-1">
        <Label htmlFor="invite-email">Email address</Label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          placeholder="colleague@example.com"
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send invite"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}

interface PendingInvitesProps {
  invitations: {
    id: string
    email: string
    role: string
    expiresAt: Date
    createdAt: Date
  }[]
  onCancel: (inviteId: string) => void
}

export function PendingInvites({ invitations, onCancel }: PendingInvitesProps) {
  if (invitations.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Pending invitations</h3>
      {invitations.map((inv) => (
        <div
          key={inv.id}
          className="flex items-center justify-between rounded-md border px-3 py-2"
        >
          <div>
            <p className="text-sm">{inv.email}</p>
            <p className="text-xs text-muted-foreground">
              Expires {new Date(inv.expiresAt).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-destructive hover:text-destructive"
            onClick={() => onCancel(inv.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
