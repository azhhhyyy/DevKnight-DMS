import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get unique document types
    const { data: typesData } = await supabase.from("documents").select("doc_type").order("doc_type")

    // Get unique companies
    const { data: companiesData } = await supabase.from("documents").select("company_name").order("company_name")

    // Get document count
    const { count } = await supabase.from("documents").select("*", { count: "exact", head: true })

    // Extract unique values
    const types = [...new Set(typesData?.map((d) => d.doc_type) || [])]
    const companies = [...new Set(companiesData?.map((d) => d.company_name) || [])]

    return NextResponse.json({
      types,
      companies,
      totalCount: count || 0,
    })
  } catch (error) {
    console.error("Filters error:", error)
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 })
  }
}
