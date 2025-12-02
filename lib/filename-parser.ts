// DevKnight DMS Filename Parser
// Format: DKC-[Type]-[NameofCompany]-[DocNumber]-[Date]
// Example: DKC-INV-Example-14411300001A-02122025

export interface ParsedFilename {
  prefix: string
  type: string
  company: string
  serial: string
  rawDate: string
  isoDate: Date
}

export interface ParseResult {
  success: boolean
  data?: ParsedFilename
  error?: string
}

// Regex pattern for validation
const FILENAME_PATTERN = /^DKC-([A-Z]+)-([A-Za-z0-9]+)-([A-Za-z0-9]+)-(\d{8})$/

export function parseFilename(filename: string): ParseResult {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "")

  // Validate against pattern
  const match = nameWithoutExt.match(FILENAME_PATTERN)

  if (!match) {
    return {
      success: false,
      error: "Invalid Naming Convention. Expected format: DKC-[Type]-[Company]-[ID]-[Date]",
    }
  }

  const [, type, company, serial, dateStr] = match

  // Parse DDMMYYYY to Date object
  const day = dateStr.substring(0, 2)
  const month = dateStr.substring(2, 4)
  const year = dateStr.substring(4, 8)

  // Validate date components
  const dayNum = Number.parseInt(day, 10)
  const monthNum = Number.parseInt(month, 10)
  const yearNum = Number.parseInt(year, 10)

  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900) {
    return {
      success: false,
      error: "Invalid date in filename. Expected format: DDMMYYYY",
    }
  }

  const isoDate = new Date(`${year}-${month}-${day}`)

  if (isNaN(isoDate.getTime())) {
    return {
      success: false,
      error: "Invalid date in filename",
    }
  }

  return {
    success: true,
    data: {
      prefix: "DKC",
      type,
      company,
      serial,
      rawDate: dateStr,
      isoDate,
    },
  }
}

// Get document type display info
export function getDocTypeInfo(type: string): { label: string; color: string } {
  const types: Record<string, { label: string; color: string }> = {
    INV: { label: "Invoice", color: "bg-blue-100 text-blue-800" },
    CTR: { label: "Contract", color: "bg-emerald-100 text-emerald-800" },
    PO: { label: "Purchase Order", color: "bg-amber-100 text-amber-800" },
    QUO: { label: "Quotation", color: "bg-purple-100 text-purple-800" },
    REC: { label: "Receipt", color: "bg-pink-100 text-pink-800" },
    RPT: { label: "Report", color: "bg-slate-100 text-slate-800" },
  }

  return types[type] || { label: type, color: "bg-gray-100 text-gray-800" }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
