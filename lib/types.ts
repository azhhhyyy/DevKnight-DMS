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
  version: number
  parent_id: string | null
  is_latest: boolean
}

// Filter state for the document list
export interface DocumentFilters {
  search: string
  types: string[]
  companies: string[]
  tags: string[]
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

export interface QuarantineDocument {
  id: string
  original_file_name: string
  file_url: string
  file_size: number | null
  file_type: string | null
  error_message: string
  uploaded_by: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  user_email: string | null
  action: string
  resource_type: string
  resource_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface SharedLink {
  id: string
  document_id: string
  token: string
  pin_hash: string | null
  expires_at: string
  max_views: number | null
  view_count: number
  created_by: string | null
  created_at: string
}

export type UserRole = "viewer" | "editor" | "admin"

export interface UserRoleRecord {
  id: string
  user_id: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface UploadResult {
  success: boolean
  document?: Document
  error?: string
  isDuplicate?: boolean
  existingDocument?: Document
  isQuarantined?: boolean
}

// Tag types for custom tagging system
export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

export interface DocumentTag {
  id: string
  document_id: string
  tag_id: string
  created_at: string
}

// Extended Document type with tags and summary
export interface DocumentWithTags extends Document {
  tags?: Tag[]
  summary?: string | null
}

// AI Rename suggestion
export interface RenameSuggestion {
  original: string
  suggested: string
  confidence: number
  breakdown: {
    type: string
    company: string
    serial: string
    date: string
  }
}
