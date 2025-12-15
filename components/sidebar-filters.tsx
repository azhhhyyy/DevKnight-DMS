"use client"

import { Calendar, Building2, FileType, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getDocTypeInfo } from "@/lib/filename-parser"
import type { DocumentFilters } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SidebarFiltersProps {
  filters: DocumentFilters
  availableTypes: string[]
  availableCompanies: string[]
  totalCount: number
  onFilterChange: (filters: Partial<DocumentFilters>) => void
  onReset: () => void
}

export function SidebarFilters({
  filters,
  availableTypes,
  availableCompanies,
  totalCount,
  onFilterChange,
  onReset,
}: SidebarFiltersProps) {
  const hasActiveFilters =
    filters.types.length > 0 || filters.companies.length > 0 || filters.dateFrom || filters.dateTo

  return (
    <div className="space-y-8 pr-2">
      {/* Stats Section */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-sidebar-primary/5 border border-sidebar-primary/10">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
          <p className="text-3xl font-bold tracking-tight text-primary mt-1">{totalCount}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-sidebar-primary/10 flex items-center justify-center">
          <FileType className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-foreground/90 tracking-wide uppercase">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={onReset}
            >
              <RotateCcw className="h-3 w-3 mr-1.5" />
              Reset
            </Button>
          )}
        </div>

        <Accordion type="multiple" defaultValue={["type", "company", "date"]} className="w-full space-y-3">
          {/* Document Type Filter */}
          <AccordionItem value="type" className="border-none rounded-lg bg-card shadow-sm border border-border/40 overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors hover:no-underline">
              <div className="flex items-center gap-2.5">
                <FileType className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Document Type</span>
                {filters.types.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
                    {filters.types.length}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3 pt-1">
                {availableTypes.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No types available</p>
                ) : (
                  availableTypes.map((type) => {
                    const typeInfo = getDocTypeInfo(type)
                    return (
                      <div key={type} className="flex items-start space-x-3 group">
                        <Checkbox
                          id={`type-${type}`}
                          checked={filters.types.includes(type)}
                          onCheckedChange={(checked) => {
                            const newTypes = checked ? [...filters.types, type] : filters.types.filter((t) => t !== type)
                            onFilterChange({ types: newTypes })
                          }}
                          className="mt-0.5"
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer flex-1 leading-tight group-hover:text-primary transition-colors">
                          <div className="flex items-center gap-2">
                            <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider", typeInfo.color)}>
                              {type}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-xs mt-0.5 block">{typeInfo.label}</span>
                        </Label>
                      </div>
                    )
                  })
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Company Filter */}
          <AccordionItem value="company" className="border-none rounded-lg bg-card shadow-sm border border-border/40 overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors hover:no-underline">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Company</span>
                {filters.companies.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
                    {filters.companies.length}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
                {availableCompanies.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No companies available</p>
                ) : (
                  availableCompanies.map((company) => (
                    <div key={company} className="flex items-center space-x-3 py-0.5 group">
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
                      <Label htmlFor={`company-${company}`} className="text-sm cursor-pointer group-hover:text-primary transition-colors truncate">
                        {company}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Date Range Filter */}
          <AccordionItem value="date" className="border-none rounded-lg bg-card shadow-sm border border-border/40 overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors hover:no-underline">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Date Range</span>
                {(filters.dateFrom || filters.dateTo) && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-1">
              <div className="space-y-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="date-from" className="text-xs font-medium text-muted-foreground">
                    From
                  </Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) => onFilterChange({ dateFrom: e.target.value || null })}
                    className="h-9 bg-muted/30"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="date-to" className="text-xs font-medium text-muted-foreground">
                    To
                  </Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) => onFilterChange({ dateTo: e.target.value || null })}
                    className="h-9 bg-muted/30"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
