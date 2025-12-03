"use client"

import { useState } from "react"
import useSWR from "swr"
import { Link2, Loader2, Trash2, Eye, Clock, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ShareWithDocument {
  id: string
  token: string
  expires_at: string
  view_count: number
  max_views: number | null
  created_at: string
  documents: {
    file_name: string
    company_name: string
    doc_serial: string
  }
}

export default function SharesPage() {
  const { data, mutate, isLoading } = useSWR("/api/admin/shares", fetcher)
  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)

  const shares: ShareWithDocument[] = data?.shares || []

  const handleRevoke = async () => {
    if (!revokeId) return
    setIsRevoking(true)

    try {
      const res = await fetch(`/api/admin/shares/${revokeId}`, { method: "DELETE" })
      if (res.ok) {
        mutate({ shares: shares.filter((s) => s.id !== revokeId) }, { revalidate: false })
      }
    } finally {
      setIsRevoking(false)
      setRevokeId(null)
    }
  }

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date()

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-violet-100">
              <Link2 className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <CardTitle>Shared Links</CardTitle>
              <CardDescription>Manage all active document share links</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : shares.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No shared links yet</p>
              <p className="text-sm">Share links will appear here when documents are shared</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shares.map((share) => {
                  const expired = isExpired(share.expires_at)
                  return (
                    <TableRow key={share.id}>
                      <TableCell>
                        <span className="font-medium truncate max-w-[200px] block">{share.documents.file_name}</span>
                        <code className="text-xs text-muted-foreground">{share.documents.doc_serial}</code>
                      </TableCell>
                      <TableCell>{share.documents.company_name}</TableCell>
                      <TableCell>
                        {expired ? (
                          <Badge variant="secondary" className="bg-gray-100">
                            Expired
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>{share.view_count}</span>
                          {share.max_views && <span className="text-muted-foreground">/ {share.max_views}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {new Date(share.expires_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={`/share/${share.token}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setRevokeId(share.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke share link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently disable this share link. Anyone with the link will no longer be able to access the
              document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isRevoking}
            >
              {isRevoking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
