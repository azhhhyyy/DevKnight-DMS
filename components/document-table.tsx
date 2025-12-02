"use client"

import { useState } from "react"
import { FileText, Eye, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { getDocTypeInfo, formatFileSize, formatDate } from "@/lib/filename-parser"
import type { Document } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DocumentTableProps {
  documents: Document[]
  onPreview: (doc: Document) => void
  onDelete: (id: string) => void
  sortBy: string
  sortOrder: "asc" | "desc"
  onSort: (column: string) => void
}

export function DocumentTable({ documents, onPreview, onDelete, sortBy, sortOrder, onSort }: DocumentTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/documents/${deleteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete(deleteId)
      }
    } catch (error) {
      console.error("Delete error:", error)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
    return sortOrder === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No documents found</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">Upload your first document or adjust your filters</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">
                <Button variant="ghost" className="h-8 p-0 font-semibold" onClick={() => onSort("doc_type")}>
                  Type
                  <SortIcon column="doc_type" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="h-8 p-0 font-semibold" onClick={() => onSort("company_name")}>
                  Company
                  <SortIcon column="company_name" />
                </Button>
              </TableHead>
              <TableHead>Document ID</TableHead>
              <TableHead>
                <Button variant="ghost" className="h-8 p-0 font-semibold" onClick={() => onSort("iso_date")}>
                  Date
                  <SortIcon column="iso_date" />
                </Button>
              </TableHead>
              <TableHead>Filename</TableHead>
              <TableHead className="w-[80px]">Size</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => {
              const typeInfo = getDocTypeInfo(doc.doc_type)
              return (
                <TableRow key={doc.id} className="group">
                  <TableCell>
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", typeInfo.color)}>
                      {typeInfo.label}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{doc.company_name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{doc.doc_serial}</code>
                  </TableCell>
                  <TableCell>{formatDate(doc.iso_date)}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                    {doc.file_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {doc.file_size ? formatFileSize(doc.file_size) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPreview(doc)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(doc.id)}
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
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
