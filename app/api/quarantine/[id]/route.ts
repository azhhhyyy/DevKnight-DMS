import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { del } from "@vercel/blob"
import { logAuditEvent } from "@/lib/audit-logger"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get document to get file URL for blob deletion
    const { data: doc, error: fetchError } = await supabase
      .from("quarantine_documents")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Delete from Vercel Blob
    try {
      await del(doc.file_url)
    } catch (blobError) {
      console.error("Blob deletion error:", blobError)
    }

    // Delete from database
    const { error } = await supabase.from("quarantine_documents").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
    }

    await logAuditEvent({
      action: "quarantine.delete",
      resourceType: "quarantine",
      resourceId: id,
      details: { fileName: doc.original_file_name },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
