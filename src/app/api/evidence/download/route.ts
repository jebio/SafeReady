import { NextRequest, NextResponse } from "next/server"
import { getSignedDownloadUrl } from "@/lib/supabase-storage"

export async function GET(request: NextRequest) {
  const storagePath = request.nextUrl.searchParams.get("path")
  if (!storagePath) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 })
  }

  const url = await getSignedDownloadUrl(storagePath)
  if (!url) {
    return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 })
  }

  return NextResponse.json({ url })
}
