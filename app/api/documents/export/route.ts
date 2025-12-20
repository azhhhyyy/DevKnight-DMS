import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logAuditEvent } from "@/lib/audit-logger"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  // Build query with filters
  let query = supabase.from("documents").select("*").eq("is_latest", true).order("iso_date", { ascending: false })

  const types = searchParams.get("types")
  const companies = searchParams.get("companies")
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")

  if (types) {
    query = query.in("doc_type", types.split(","))
  }
  if (companies) {
    query = query.in("company_name", companies.split(","))
  }
  if (dateFrom) {
    query = query.gte("iso_date", dateFrom)
  }
  if (dateTo) {
    query = query.lte("iso_date", dateTo)
  }

  const { data: documents, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Generate CSV
  const headers = [
    "Type",
    "Company",
    "Document ID",
    "Date",
    "Filename",
    "Version",
    "Size (bytes)",
    "Summary",
    "Created At",
  ]

  const rows = documents.map((doc) => [
    doc.doc_type,
    doc.company_name,
    doc.doc_serial,
    doc.iso_date,
    doc.file_name,
    doc.version || 1,
    doc.file_size || "",
    doc.summary || "",
    doc.created_at,
  ])

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n")

  await logAuditEvent({
    action: "DOCUMENTS_EXPORTED",
    resourceType: "export",
    details: { count: documents.length, filters: { types, companies, dateFrom, dateTo } },
  })

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="devknight-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}
