"use client"

import { Calendar, Building2, FileType, RotateCcw, Tag } from "lucide-react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getDocTypeInfo } from "@/lib/filename-parser"
import type { DocumentFilters, Tag as TagType } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SidebarFiltersProps {
  filters: DocumentFilters
  availableTypes: string[]
  availableCompanies: string[]
  totalCount: number
  onFilterChange: (filters: Partial<DocumentFilters>) => void
  onReset: () => void
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function SidebarFilters({
  filters,
  availableTypes,
  availableCompanies,
  totalCount,
  onFilterChange,
  onReset,
}: SidebarFiltersProps) {
  const { data: tagsData } = useSWR<{ tags: TagType[] }>("/api/tags", fetcher)
  const availableTags = tagsData?.tags || []

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.companies.length > 0 ||
    (filters.tags?.length || 0) > 0 ||
    filters.dateFrom ||
    filters.dateTo

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-2xl font-bold">{totalCount}</p>
        <p className="text-sm text-muted-foreground">Total Documents</p>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      )}

      <Accordion type="multiple" defaultValue={["type", "company", "tags", "date"]} className="space-y-2">
        {/* Document Type Filter */}
        <AccordionItem value="type" className="border rounded-lg px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <FileType className="h-4 w-4" />
              <span className="font-medium">Document Type</span>
              {filters.types.length > 0 && (
                <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  {filters.types.length}
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-2">
              {availableTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No types available</p>
              ) : (
                availableTypes.map((type) => {
                  const typeInfo = getDocTypeInfo(type)
                  return (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={filters.types.includes(type)}
                        onCheckedChange={(checked) => {
                          const newTypes = checked ? [...filters.types, type] : filters.types.filter((t) => t !== type)
                          onFilterChange({ types: newTypes })
                        }}
                      />
                      <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer flex items-center gap-2">
                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium", typeInfo.color)}>{type}</span>
                        <span className="text-muted-foreground">{typeInfo.label}</span>
                      </Label>
                    </div>
                  )
                })
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Company Filter */}
        <AccordionItem value="company" className="border rounded-lg px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">Company</span>
              {filters.companies.length > 0 && (
                <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  {filters.companies.length}
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableCompanies.length === 0 ? (
                <p className="text-sm text-muted-foreground">No companies available</p>
              ) : (
                availableCompanies.map((company) => (
                  <div key={company} className="flex items-center space-x-2">
                    <Checkbox
                      id={`company-${company}`}
                      checked={filters.companies.includes(company)}
                      onCheckedChange={(checked) => {
                        const newCompanies = checked
                          ? [...filters.companies, company]
                          : filters.companies.filter((c) => c !== company)
                        onFilterChange({ companies: newCompanies })
                      }}
                    />
                    <Label htmlFor={`company-${company}`} className="text-sm cursor-pointer">
                      {company}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tags" className="border rounded-lg px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="font-medium">Tags</span>
              {(filters.tags?.length || 0) > 0 && (
                <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  {filters.tags?.length}
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tags available</p>
              ) : (
                availableTags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={filters.tags?.includes(tag.id) || false}
                      onCheckedChange={(checked) => {
                        const currentTags = filters.tags || []
                        const newTags = checked ? [...currentTags, tag.id] : currentTags.filter((t) => t !== tag.id)
                        onFilterChange({ tags: newTags })
                      }}
                    />
                    <Label htmlFor={`tag-${tag.id}`} className="text-sm cursor-pointer flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Date Range Filter */}
        <AccordionItem value="date" className="border rounded-lg px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Date Range</span>
              {(filters.dateFrom || filters.dateTo) && (
                <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">Active</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-3">
              <div>
                <Label htmlFor="date-from" className="text-xs text-muted-foreground">
                  From
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => onFilterChange({ dateFrom: e.target.value || null })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="date-to" className="text-xs text-muted-foreground">
                  To
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => onFilterChange({ dateTo: e.target.value || null })}
                  className="mt-1"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
