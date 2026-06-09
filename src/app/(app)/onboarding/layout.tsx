import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const existingMember = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (existingMember) redirect("/dashboard")

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  )
}
