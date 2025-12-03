"use client"

import type React from "react"

import useSWR from "swr"
import { ScrollText, Loader2, FileText, Trash2, Upload, Share2, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { AuditLog } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const actionIcons: Record<string, React.ReactNode> = {
  "document.upload": <Upload className="h-4 w-4 text-emerald-500" />,
  "document.view": <Eye className="h-4 w-4 text-blue-500" />,
  "document.delete": <Trash2 className="h-4 w-4 text-destructive" />,
  "document.share": <Share2 className="h-4 w-4 text-violet-500" />,
  "quarantine.upload": <Upload className="h-4 w-4 text-amber-500" />,
  "quarantine.delete": <Trash2 className="h-4 w-4 text-destructive" />,
}

const actionLabels: Record<string, string> = {
  "document.upload": "Document Uploaded",
  "document.view": "Document Viewed",
  "document.download": "Document Downloaded",
  "document.delete": "Document Deleted",
  "document.share": "Document Shared",
  "quarantine.upload": "Quarantine Upload",
  "quarantine.delete": "Quarantine Delete",
  "quarantine.recover": "Quarantine Recover",
  "share.create": "Share Link Created",
  "share.access": "Share Link Accessed",
  "share.revoke": "Share Link Revoked",
}

export default function AuditLogsPage() {
  const { data, isLoading } = useSWR("/api/audit-logs", fetcher)

  const logs: AuditLog[] = data?.logs || []

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <ScrollText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Complete history of all actions performed in the system</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ScrollText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs yet</p>
              <p className="text-sm">Actions will be logged here for compliance tracking</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {actionIcons[log.action] || <FileText className="h-4 w-4" />}
                        <span className="font-medium">{actionLabels[log.action] || log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{log.user_email || "System"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {log.resource_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.details && (
                        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                          {((log.details as Record<string, unknown>).fileName as string) || "-"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
