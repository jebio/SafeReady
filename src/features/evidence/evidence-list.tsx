"use client"

import { useState } from "react"
import { FileText, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

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
  onDelete: (id: string) => void
}

export function EvidenceList({ files, onDelete }: EvidenceListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={async () => {
                const res = await fetch(`/api/evidence/download?path=${encodeURIComponent(file.storagePath)}`)
                if (!res.ok) return
                const { url } = await res.json()
                if (url) window.open(url, "_blank")
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer text-destructive hover:text-destructive"
              disabled={deleting === file.id}
              onClick={() => {
                if (window.confirm("Delete this evidence file?")) {
                  setDeleting(file.id)
                  onDelete(file.id)
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
