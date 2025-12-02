import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseFilename } from "@/lib/filename-parser"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate filename against naming convention
    const parseResult = parseFilename(file.name)

    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json({ error: parseResult.error || "Invalid filename" }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`documents/${file.name}`, file, {
      access: "public",
    })

    // Save metadata to Supabase
    const supabase = await createClient()
    const { data, error: dbError } = await supabase
      .from("documents")
      .insert({
        file_name: file.name,
        file_url: blob.url,
        file_size: file.size,
        file_type: file.type,
        prefix: parseResult.data.prefix,
        doc_type: parseResult.data.type,
        company_name: parseResult.data.company,
        doc_serial: parseResult.data.serial,
        raw_date: parseResult.data.rawDate,
        iso_date: parseResult.data.isoDate.toISOString().split("T")[0],
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save document" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      document: data,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
