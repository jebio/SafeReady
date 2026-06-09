import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { SignupForm } from "@/features/auth/signup-form"

interface SignupPageProps {
  searchParams: Promise<{ token?: string; email?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const { token, email } = params

  if (!token || !email) {
    redirect("/login")
  }

  const invitation = await db.invitation.findUnique({
    where: { token },
  })

  if (!invitation || invitation.usedAt || invitation.expiresAt < new Date()) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Invalid invitation</h1>
        <p className="text-sm text-muted-foreground">
          This invitation link is invalid or has expired. Please ask your
          workspace owner to send a new invitation.
        </p>
      </div>
    )
  }

  if (invitation.email !== email) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Email mismatch</h1>
        <p className="text-sm text-muted-foreground">
          This invitation was sent to a different email address. Please check
          your invitation email.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          You've been invited to join SafeReady
        </p>
      </div>
      <SignupForm email={email} token={token} />
    </div>
  )
}
