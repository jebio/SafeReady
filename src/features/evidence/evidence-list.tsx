"use client"

import { FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { getSignedDownloadUrl } from "@/lib/supabase-storage"

interface EvidenceFile {
  id: string
  storagePath: string
  originalFilename: string
  contentType: string
  fileSize: number
  uploadedAt: Date
  uploadedBy: { name: string } | null
}

interface EvidenceListProps {
  files: EvidenceFile[]
}

export function EvidenceList({ files }: EvidenceListProps) {
  if (files.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No evidence files uploaded yet.</p>
    )
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between rounded-md border px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{file.originalFilename}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(file.uploadedAt)}
                {file.uploadedBy && ` by ${file.uploadedBy.name}`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={async () => {
              const url = await getSignedDownloadUrl(file.storagePath)
              if (url) window.open(url, "_blank")
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
