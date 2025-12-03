"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileText, CheckCircle, XCircle, Loader2, AlertTriangle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { parseFilename, getDocTypeInfo, formatFileSize } from "@/lib/filename-parser"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Document } from "@/lib/types"

interface UploadZoneProps {
  onUploadSuccess: () => void
}

interface ParsedPreview {
  prefix: string
  type: string
  company: string
  serial: string
  rawDate: string
  isoDate: Date
}

interface DuplicateDialogState {
  open: boolean
  existingDocument: Document | null
  pendingFile: File | null
}

export function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedPreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [canQuarantine, setCanQuarantine] = useState(false)
  const [status, setStatus] = useState<"idle" | "validating" | "uploading" | "success" | "error">("idle")

  const [duplicateDialog, setDuplicateDialog] = useState<DuplicateDialogState>({
    open: false,
    existingDocument: null,
    pendingFile: null,
  })

  const validateFile = useCallback((selectedFile: File) => {
    setStatus("validating")
    setError(null)
    setParsedData(null)
    setCanQuarantine(false)
    setFile(selectedFile)

    const result = parseFilename(selectedFile.name)

    if (!result.success || !result.data) {
      setError(result.error || "Invalid filename")
      setCanQuarantine(true)
      setStatus("error")
      return
    }

    setParsedData(result.data)
    setStatus("idle")
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        validateFile(droppedFile)
      }
    },
    [validateFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        validateFile(selectedFile)
      }
    },
    [validateFile],
  )

  const handleUpload = async (options?: { forceUpload?: boolean; createVersion?: boolean; quarantine?: boolean }) => {
    const targetFile = options?.quarantine ? file : duplicateDialog.pendingFile || file
    if (!targetFile) return
    if (!options?.quarantine && !parsedData) return

    setStatus("uploading")
    setDuplicateDialog({ open: false, existingDocument: null, pendingFile: null })

    try {
      const formData = new FormData()
      formData.append("file", targetFile)
      if (options?.forceUpload) formData.append("forceUpload", "true")
      if (options?.createVersion) formData.append("createVersion", "true")
      if (options?.quarantine) formData.append("quarantine", "true")

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      // Handle duplicate detection
      if (response.status === 409 && data.isDuplicate) {
        setStatus("idle")
        setDuplicateDialog({
          open: true,
          existingDocument: data.existingDocument,
          pendingFile: targetFile,
        })
        return
      }

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setStatus("success")
      setTimeout(() => {
        setFile(null)
        setParsedData(null)
        setStatus("idle")
        setCanQuarantine(false)
        onUploadSuccess()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setStatus("error")
    }
  }

  const handleQuarantineUpload = () => {
    handleUpload({ quarantine: true })
  }

  const handleClear = () => {
    setFile(null)
    setParsedData(null)
    setError(null)
    setCanQuarantine(false)
    setStatus("idle")
  }

  const typeInfo = parsedData ? getDocTypeInfo(parsedData.type) : null

  return (
    <>
      <Card className="p-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging && "border-primary bg-primary/5",
            status === "error" && "border-destructive bg-destructive/5",
            status === "success" && "border-emerald-500 bg-emerald-50",
            !isDragging && status === "idle" && "border-muted-foreground/25 hover:border-muted-foreground/50",
          )}
        >
          {status === "success" ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
              <p className="text-lg font-medium text-emerald-700">Document Uploaded Successfully</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4">
                {file ? (
                  <FileText className="h-12 w-12 text-muted-foreground" />
                ) : (
                  <Upload className="h-12 w-12 text-muted-foreground" />
                )}

                {!file ? (
                  <>
                    <div>
                      <p className="text-lg font-medium">Drag & Drop your document here</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse. Files must follow naming convention.
                      </p>
                    </div>
                    <label>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      />
                      <Button variant="outline" asChild>
                        <span className="cursor-pointer">Browse Files</span>
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground">Format: DKC-[Type]-[Company]-[ID]-[DDMMYYYY]</p>
                  </>
                ) : (
                  <div className="w-full max-w-md">
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleClear}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>

                    {error && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                        <p className="text-sm text-destructive font-medium">{error}</p>
                        <p className="text-xs text-destructive/70 mt-1">
                          Expected: DKC-[Type]-[Company]-[ID]-[DDMMYYYY]
                        </p>
                        {canQuarantine && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 border-amber-500 text-amber-700 hover:bg-amber-50 bg-transparent"
                            onClick={handleQuarantineUpload}
                            disabled={status === "uploading"}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Save to Quarantine
                          </Button>
                        )}
                      </div>
                    )}

                    {parsedData && (
                      <div className="bg-muted/30 rounded-lg p-4 mb-4 text-left">
                        <p className="text-sm font-medium mb-3">Parsed Metadata Preview</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <span className={cn("ml-2 px-2 py-0.5 rounded text-xs font-medium", typeInfo?.color)}>
                              {typeInfo?.label}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Company:</span>
                            <span className="ml-2 font-medium">{parsedData.company}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Serial:</span>
                            <span className="ml-2 font-mono text-xs">{parsedData.serial}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <span className="ml-2">{parsedData.isoDate.toLocaleDateString("en-GB")}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={handleClear}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleUpload()} disabled={!parsedData || status === "uploading"}>
                        {status === "uploading" ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Document
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      <Dialog
        open={duplicateDialog.open}
        onOpenChange={(open) => !open && setDuplicateDialog({ open: false, existingDocument: null, pendingFile: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-amber-500" />
              Duplicate Document Detected
            </DialogTitle>
            <DialogDescription>A document with the same serial number already exists in the system.</DialogDescription>
          </DialogHeader>

          {duplicateDialog.existingDocument && (
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Existing Document:</p>
              <div className="space-y-1 text-muted-foreground">
                <p>
                  <span className="text-foreground">Filename:</span> {duplicateDialog.existingDocument.file_name}
                </p>
                <p>
                  <span className="text-foreground">Serial:</span> {duplicateDialog.existingDocument.doc_serial}
                </p>
                <p>
                  <span className="text-foreground">Version:</span> {duplicateDialog.existingDocument.version || 1}
                </p>
                <p>
                  <span className="text-foreground">Uploaded:</span>{" "}
                  {new Date(duplicateDialog.existingDocument.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDuplicateDialog({ open: false, existingDocument: null, pendingFile: null })}
            >
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => handleUpload({ forceUpload: true })}>
              Replace Existing
            </Button>
            <Button onClick={() => handleUpload({ createVersion: true })}>Create New Version</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
