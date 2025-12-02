"use client"

import { X, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getDocTypeInfo, formatFileSize, formatDate } from "@/lib/filename-parser"
import type { Document } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DocumentPreviewProps {
  document: Document | null
  open: boolean
  onClose: () => void
}

export function DocumentPreview({ document, open, onClose }: DocumentPreviewProps) {
  if (!document) return null

  const typeInfo = getDocTypeInfo(document.doc_type)
  const isPDF = document.file_type?.includes("pdf")
  const isImage = document.file_type?.startsWith("image/")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2">
                <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", typeInfo.color)}>
                  {typeInfo.label}
                </span>
                <span>{document.company_name}</span>
              </DialogTitle>
              <DialogDescription asChild>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    ID: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{document.doc_serial}</code>
                  </span>
                  <span>Date: {formatDate(document.iso_date)}</span>
                  {document.file_size && <span>Size: {formatFileSize(document.file_size)}</span>}
                </div>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={document.file_url} download={document.file_name}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-muted/30 p-4">
          {isPDF ? (
            <iframe
              src={`${document.file_url}#toolbar=0`}
              className="w-full h-full rounded-lg border bg-white"
              title={document.file_name}
            />
          ) : isImage ? (
            <div className="flex items-center justify-center h-full">
              <img
                src={document.file_url || "/placeholder.svg"}
                alt={document.file_name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
              <Button asChild>
                <a href={document.file_url} download={document.file_name}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
