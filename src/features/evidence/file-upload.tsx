"use client"

import { useState, useRef } from "react"
import { Upload, File } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  occurrenceId: string
  onUploadComplete: (storagePath: string) => void
  onError: (error: string) => void
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"]
const MAX_SIZE = 5 * 1024 * 1024

export function FileUpload({ occurrenceId, onUploadComplete, onError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return "File type not allowed (JPG, PNG, PDF only)"
    if (file.size > MAX_SIZE) return "File too large (max 5MB)"
    return null
  }

  const handleFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      onError(validationError)
      return
    }

    setIsUploading(true)

    try {
      const uploadForm = new FormData()
      uploadForm.append("occurrenceId", occurrenceId)
      uploadForm.append("filename", file.name)
      uploadForm.append("contentType", file.type)
      uploadForm.append("fileSize", String(file.size))

      const uploadRes = await fetch("/api/evidence/upload", {
        method: "POST",
        body: uploadForm,
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.text()
        throw new Error(err || "Failed to get upload URL")
      }

      const { signedUrl, storagePath } = await uploadRes.json()

      // Upload file directly to Supabase via signed URL
      const putRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })

      if (!putRes.ok) throw new Error("Failed to upload file to storage")

      onUploadComplete(storagePath)
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
        isDragging && "border-primary bg-primary/5",
        "hover:border-primary/50",
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
      }}
      onClick={() => inputRef.current?.click()}
    >
      {isUploading ? (
        <div className="flex items-center gap-2">
          <File className="h-8 w-8 text-primary" />
          <span className="text-sm">Uploading...</span>
        </div>
      ) : (
        <>
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drop a file or click to browse
          </p>
          <p className="text-xs text-muted-foreground">JPG, PNG, PDF up to 5MB</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  )
}
