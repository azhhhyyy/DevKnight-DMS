-- Create documents table for DevKnight DMS
-- Stores metadata parsed from filenames following DKC-[Type]-[Company]-[ID]-[Date] convention

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  -- Parsed metadata from filename
  prefix TEXT NOT NULL DEFAULT 'DKC',
  doc_type TEXT NOT NULL,
  company_name TEXT NOT NULL,
  doc_serial TEXT NOT NULL,
  raw_date TEXT NOT NULL,
  iso_date DATE NOT NULL,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient searching and filtering
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_company_name ON documents(company_name);
CREATE INDEX IF NOT EXISTS idx_documents_iso_date ON documents(iso_date);
CREATE INDEX IF NOT EXISTS idx_documents_doc_serial ON documents(doc_serial);

-- Full text search index for omni-search capability
CREATE INDEX IF NOT EXISTS idx_documents_search ON documents USING GIN (
  to_tsvector('english', file_name || ' ' || doc_type || ' ' || company_name || ' ' || doc_serial)
);

-- Enable Row Level Security (public access for MVP - no auth required)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations for MVP (no auth)
CREATE POLICY "Allow all access to documents" ON documents
  FOR ALL
  USING (true)
  WITH CHECK (true);
