import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get the document to find the blob URL
    const { data: doc, error: fetchError } = await supabase.from("documents").select("file_url").eq("id", id).single()

    if (fetchError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Delete from Vercel Blob
    try {
      await del(doc.file_url)
    } catch (blobError) {
      console.error("Blob delete error:", blobError)
    }

    // Delete from database
    const { error: deleteError } = await supabase.from("documents").delete().eq("id", id)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
