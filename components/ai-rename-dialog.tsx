"use client"

import { useState } from "react"
import { Sparkles, ArrowRight, Copy, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { RenameSuggestion } from "@/lib/types"

interface AIRenameDialogProps {
  open: boolean
  onClose: () => void
  filename: string
  onAccept: (newFilename: string) => void
}

export function AIRenameDialog({ open, onClose, filename, onAccept }: AIRenameDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<RenameSuggestion | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/ai/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      })

      if (!res.ok) throw new Error("Failed to generate suggestion")

      const data = await res.json()
      setSuggestion(data)
    } catch (err) {
      setError("Failed to generate suggestion. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (suggestion?.suggested) {
      navigator.clipboard.writeText(suggestion.suggested)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleAccept = () => {
    if (suggestion?.suggested) {
      onAccept(suggestion.suggested)
      onClose()
    }
  }

  const handleClose = () => {
    setSuggestion(null)
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            AI Smart Rename
          </DialogTitle>
          <DialogDescription>
            Let AI suggest a properly formatted filename following the DKC naming convention.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Original Filename</label>
            <div className="mt-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">{filename}</div>
          </div>

          {!suggestion && !isLoading && (
            <Button onClick={handleGenerate} className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Suggestion
            </Button>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Analyzing filename...</span>
            </div>
          )}

          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

          {suggestion && (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">Suggested rename</span>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <code className="font-mono text-sm text-emerald-700 dark:text-emerald-400 break-all">
                    {suggestion.suggested}
                  </code>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <span className="font-medium">{suggestion.breakdown.type}</span>
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">Company:</span>{" "}
                  <span className="font-medium">{suggestion.breakdown.company}</span>
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">ID:</span>{" "}
                  <span className="font-medium">{suggestion.breakdown.serial}</span>
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">Date:</span>{" "}
                  <span className="font-medium">{suggestion.breakdown.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${suggestion.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.round(suggestion.confidence * 100)}% confidence
                </span>
              </div>

              {suggestion.reasoning && <p className="text-sm text-muted-foreground italic">{suggestion.reasoning}</p>}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {suggestion && <Button onClick={handleAccept}>Use This Name</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
