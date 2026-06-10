"use client"

import { useRouter } from "next/navigation"
import { FileUpload } from "./file-upload"
import { EvidenceList } from "./evidence-list"

interface EvidenceFile {
  id: string
  storagePath: string
  originalFilename: string
  contentType: string
  fileSize: number
  uploadedAt: Date
  uploadedBy: { name: string } | null
}

interface EvidenceSectionProps {
  occurrenceId: string
  files: EvidenceFile[]
}

export function EvidenceSection({ occurrenceId, files }: EvidenceSectionProps) {
  const router = useRouter()

  const handleUploadComplete = () => {
    router.refresh()
  }

  const handleDelete = async (evidenceId: string) => {
    const res = await fetch("/api/evidence/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evidenceId }),
    })

    if (!res.ok) {
      const err = await res.text()
      alert(err || "Failed to delete evidence")
      return
    }

    router.refresh()
  }

  return (
    <div className="space-y-4">
      <FileUpload
        occurrenceId={occurrenceId}
        onUploadComplete={handleUploadComplete}
        onError={(error) => {
          alert(error)
        }}
      />
      <EvidenceList files={files} onDelete={handleDelete} />
    </div>
  )
}
