import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const secretKey = process.env.SUPABASE_SECRET_KEY!

// Server-side client with service role — bypasses RLS on storage operations
export const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false },
})

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

function sanitizeFilename(filename: string): string {
  // Keep the base name (without extension), strip special chars, truncate to 40 chars
  const name = filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40)
  const ext = filename.split(".").pop() || "bin"
  const timestamp = Date.now()
  return `${name}_${timestamp}.${ext}`
}

export async function getSignedUploadUrl(
  workspaceId: string,
  occurrenceId: string,
  filename: string,
  contentType: string,
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(contentType)) {
    return { ok: false, error: "File type not allowed. Use JPG, PNG, or PDF." }
  }

  const sanitized = sanitizeFilename(filename)
  const storagePath = `${workspaceId}/${occurrenceId}/${sanitized}`

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

export async function deleteStorageFile(storagePath: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath])

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
