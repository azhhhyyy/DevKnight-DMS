import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { FileText, Download, ExternalLink, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDocTypeInfo, formatFileSize } from "@/lib/filename-parser"
import { cn } from "@/lib/utils"

interface SharePageProps {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params
  const supabase = await createClient()

  // Find share link
  const { data: share, error: shareError } = await supabase
    .from("shared_links")
    .select("*, documents(*)")
    .eq("token", token)
    .single()

  if (shareError || !share) {
    notFound()
  }

  // Check if expired
  const isExpired = new Date(share.expires_at) < new Date()

  // Check if max views exceeded
  const isMaxViewsExceeded = share.max_views && share.view_count >= share.max_views

  if (isExpired || isMaxViewsExceeded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle>Link Expired</CardTitle>
            <CardDescription>
              {isExpired ? "This share link has expired." : "This share link has reached its maximum number of views."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Increment view count
  await supabase
    .from("shared_links")
    .update({ view_count: share.view_count + 1 })
    .eq("id", share.id)

  const doc = share.documents
  const typeInfo = getDocTypeInfo(doc.doc_type)
  const expiresAt = new Date(share.expires_at)

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate">{doc.file_name}</CardTitle>
              <CardDescription>Shared document</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Type</p>
              <span className={cn("inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium", typeInfo.color)}>
                {typeInfo.label}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground">Company</p>
              <p className="font-medium mt-1">{doc.company_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Document ID</p>
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono mt-1 inline-block">{doc.doc_serial}</code>
            </div>
            <div>
              <p className="text-muted-foreground">Size</p>
              <p className="font-medium mt-1">{doc.file_size ? formatFileSize(doc.file_size) : "-"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Clock className="h-4 w-4" />
            <span>
              Link expires{" "}
              {expiresAt.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" asChild>
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Document
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={doc.file_url} download={doc.file_name}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
