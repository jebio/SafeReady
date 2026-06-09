import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { getSignedUploadUrl } from "@/lib/supabase-storage"
import { z } from "zod"

const uploadSchema = z.object({
  occurrenceId: z.string().min(1),
  filename: z.string().min(1),
  contentType: z.enum(["image/jpeg", "image/png", "application/pdf"]),
  fileSize: z.coerce.number().max(5 * 1024 * 1024),
})

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const parsed = uploadSchema.safeParse({
    occurrenceId: formData.get("occurrenceId"),
    filename: formData.get("filename"),
    contentType: formData.get("contentType"),
    fileSize: formData.get("fileSize"),
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { occurrenceId, filename, contentType, fileSize } = parsed.data

  const occurrence = await db.taskOccurrence.findUnique({
    where: { id: occurrenceId },
  })
  if (!occurrence) {
    return NextResponse.json({ error: "Occurrence not found" }, { status: 404 })
  }

  const member = await db.workspaceMember.findFirst({
    where: { workspaceId: occurrence.workspaceId, userId: session.user.id },
  })
  if (!member) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  const result = await getSignedUploadUrl(
    occurrence.workspaceId,
    occurrenceId,
    filename,
    contentType,
  )

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  await db.evidenceFile.create({
    data: {
      workspaceId: occurrence.workspaceId,
      occurrenceId,
      storagePath: result.storagePath,
      originalFilename: filename,
      contentType,
      fileSize,
      uploadedByUserId: session.user.id,
    },
  })

  return NextResponse.json({
    signedUrl: result.signedUrl,
    storagePath: result.storagePath,
  })
}
