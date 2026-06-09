import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const BUCKET = "evidence-files"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
]

export type UploadResult =
  | { ok: true; signedUrl: string; storagePath: string }
  | { ok: false; error: string }

export async function getSignedUploadUrl(
  workspaceId: string,
  occurrenceId: string,
  filename: string,
  contentType: string,
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(contentType)) {
    return { ok: false, error: "File type not allowed. Use JPG, PNG, or PDF." }
  }

  const ext = filename.split(".").pop() || "jpg"
  const storagePath = `${workspaceId}/${occurrenceId}/${crypto.randomUUID()}.${ext}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath)

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, signedUrl: data.signedUrl, storagePath }
}

export async function getSignedDownloadUrl(storagePath: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600) // 1 hour

  return data?.signedUrl ?? null
}
