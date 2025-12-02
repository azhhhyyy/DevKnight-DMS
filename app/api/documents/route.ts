import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Get filter parameters
    const search = searchParams.get("search") || ""
    const types = searchParams.get("types")?.split(",").filter(Boolean) || []
    const companies = searchParams.get("companies")?.split(",").filter(Boolean) || []
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const sortBy = searchParams.get("sortBy") || "iso_date"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Build query
    let query = supabase.from("documents").select("*")

    // Apply omni-search (searches across type, company, serial, filename)
    if (search) {
      query = query.or(
        `doc_type.ilike.%${search}%,company_name.ilike.%${search}%,doc_serial.ilike.%${search}%,file_name.ilike.%${search}%`,
      )
    }

    // Apply type filter
    if (types.length > 0) {
      query = query.in("doc_type", types)
    }

    // Apply company filter
    if (companies.length > 0) {
      query = query.in("company_name", companies)
    }

    // Apply date range filter
    if (dateFrom) {
      query = query.gte("iso_date", dateFrom)
    }
    if (dateTo) {
      query = query.lte("iso_date", dateTo)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
    }

    return NextResponse.json({ documents: data || [] })
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
