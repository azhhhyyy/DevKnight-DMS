import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("quarantine_documents")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Quarantine fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch quarantine documents" }, { status: 500 })
    }

    return NextResponse.json({ documents: data })
  } catch (error) {
    console.error("Quarantine error:", error)
    return NextResponse.json({ error: "Failed to fetch quarantine documents" }, { status: 500 })
  }
}
