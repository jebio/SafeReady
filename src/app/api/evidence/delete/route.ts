import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { deleteStorageFile } from "@/lib/supabase-storage"
import { z } from "zod"

const deleteSchema = z.object({
  evidenceId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = deleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { evidenceId } = parsed.data

  const evidence = await db.evidenceFile.findUnique({
    where: { id: evidenceId },
    include: { occurrence: { select: { workspaceId: true } } },
  })
  if (!evidence) {
    return NextResponse.json({ error: "Evidence not found" }, { status: 404 })
  }

  const member = await db.workspaceMember.findFirst({
    where: { workspaceId: evidence.occurrence.workspaceId, userId: session.user.id },
  })
  if (!member) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  const storageResult = await deleteStorageFile(evidence.storagePath)
  if (!storageResult.ok) {
    return NextResponse.json({ error: storageResult.error }, { status: 500 })
  }

  await db.evidenceFile.delete({ where: { id: evidenceId } })

  return NextResponse.json({ ok: true })
}
