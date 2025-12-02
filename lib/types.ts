// Document type definition matching the database schema
export interface Document {
  id: string
  file_name: string
  file_url: string
  file_size: number | null
  file_type: string | null
  prefix: string
  doc_type: string
  company_name: string
  doc_serial: string
  raw_date: string
  iso_date: string
  created_at: string
  updated_at: string
}

// Filter state for the document list
export interface DocumentFilters {
  search: string
  types: string[]
  companies: string[]
  dateFrom: string | null
  dateTo: string | null
}

// Upload state
export interface UploadState {
  file: File | null
  status: "idle" | "validating" | "uploading" | "success" | "error"
  error: string | null
  parsedData: {
    prefix: string
    type: string
    company: string
    serial: string
    rawDate: string
    isoDate: Date
  } | null
}
