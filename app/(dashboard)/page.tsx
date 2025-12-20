"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import { Plus, Download, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search-bar"
import { SidebarFilters } from "@/components/sidebar-filters"
import { DocumentTable } from "@/components/document-table"
import { DocumentPreview } from "@/components/document-preview"
import { UploadZone } from "@/components/upload-zone"
import { AIRenameDialog } from "@/components/ai-rename-dialog"
import type { Document, DocumentFilters } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const fetcher = async (url: string) => {
  const res = await fetch(url)

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error: ${res.status}`)
  }

  return res.json()
}

const defaultFilters: DocumentFilters = {
  search: "",
  types: [],
  companies: [],
  tags: [],
  dateFrom: null,
  dateTo: null,
}

export default function Dashboard() {
  const [filters, setFilters] = useState<DocumentFilters>(defaultFilters)
  const [sortBy, setSortBy] = useState("iso_date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [showAIRename, setShowAIRename] = useState(false)
  const [renameFilename, setRenameFilename] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search])

  // Build query string
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set("search", debouncedSearch)
    if (filters.types.length) params.set("types", filters.types.join(","))
    if (filters.companies.length) params.set("companies", filters.companies.join(","))
    if (filters.tags?.length) params.set("tags", filters.tags.join(","))
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
    if (filters.dateTo) params.set("dateTo", filters.dateTo)
    params.set("sortBy", sortBy)
    params.set("sortOrder", sortOrder)
    return params.toString()
  }, [
    debouncedSearch,
    filters.types,
    filters.companies,
    filters.tags,
    filters.dateFrom,
    filters.dateTo,
    sortBy,
    sortOrder,
  ])

  // Fetch documents
  const { data: documentsData, mutate: mutateDocuments } = useSWR(`/api/documents?${buildQueryString()}`, fetcher, {
    revalidateOnFocus: false,
  })

  // Fetch filter options
  const { data: filtersData, mutate: mutateFilters } = useSWR("/api/documents/filters", fetcher, {
    revalidateOnFocus: false,
  })

  const documents: Document[] = documentsData?.documents || []
  const availableTypes: string[] = filtersData?.types || []
  const availableCompanies: string[] = filtersData?.companies || []
  const totalCount: number = filtersData?.totalCount || 0

  const handleFilterChange = (newFilters: Partial<DocumentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleResetFilters = () => {
    setFilters(defaultFilters)
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const handleDelete = (id: string) => {
    mutateDocuments({ documents: documents.filter((d) => d.id !== id) }, { revalidate: false })
    mutateFilters()
  }

  const handleUploadSuccess = () => {
    mutateDocuments()
    mutateFilters()
    setShowUpload(false)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      if (filters.types.length) params.set("types", filters.types.join(","))
      if (filters.companies.length) params.set("companies", filters.companies.join(","))
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
      if (filters.dateTo) params.set("dateTo", filters.dateTo)

      const res = await fetch(`/api/documents/export?${params.toString()}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `devknight-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 border-r bg-background p-6 min-h-[calc(100vh-4rem)] flex-shrink-0">
          <SidebarFilters
            filters={filters}
            availableTypes={availableTypes}
            availableCompanies={availableCompanies}
            totalCount={totalCount}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Search & Actions Bar */}
          <div className="flex items-center gap-4 mb-6">
            <SearchBar value={filters.search} onChange={(search) => handleFilterChange({ search })} />
            <Button variant="outline" onClick={() => setShowAIRename(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              AI Rename
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
            <Button onClick={() => setShowUpload(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload New
            </Button>
          </div>

          {/* Document Table */}
          <DocumentTable
            documents={documents}
            onPreview={setPreviewDoc}
            onDelete={handleDelete}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </main>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document following the naming convention: DKC-[Type]-[Company]-[ID]-[DDMMYYYY]
            </DialogDescription>
          </DialogHeader>
          <UploadZone onUploadSuccess={handleUploadSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={showAIRename && !renameFilename} onOpenChange={setShowAIRename}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              AI Smart Rename
            </DialogTitle>
            <DialogDescription>
              Enter a filename to get AI-powered rename suggestions following the DKC naming convention.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter original filename..."
              className="w-full px-3 py-2 border rounded-lg"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value) {
                  setRenameFilename(e.currentTarget.value)
                }
              }}
            />
            <p className="text-sm text-muted-foreground">Example: Invoice_Acme_Dec2025.pdf</p>
          </div>
        </DialogContent>
      </Dialog>

      <AIRenameDialog
        open={!!renameFilename}
        onClose={() => {
          setRenameFilename("")
          setShowAIRename(false)
        }}
        filename={renameFilename}
        onAccept={(newName) => {
          navigator.clipboard.writeText(newName)
          setRenameFilename("")
          setShowAIRename(false)
        }}
      />

      {/* Preview Modal */}
      <DocumentPreview document={previewDoc} open={!!previewDoc} onClose={() => setPreviewDoc(null)} />
    </>
  )
}
