import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logAuditEvent } from "@/lib/audit-logger"

// GET tags for a document
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.from("document_tags").select("tag_id, tags(*)").eq("document_id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const tags = data.map((dt: { tags: unknown }) => dt.tags)
  return NextResponse.json({ tags })
}

// POST add tag to document
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { tagId } = await request.json()

  const { error } = await supabase.from("document_tags").insert({ document_id: id, tag_id: tagId })

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Tag already assigned" }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAuditEvent({
    action: "TAG_ADDED",
    resourceType: "document",
    resourceId: id,
    details: { tagId },
  })

  return NextResponse.json({ success: true })
}

// DELETE remove tag from document
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const tagId = searchParams.get("tagId")

  if (!tagId) {
    return NextResponse.json({ error: "tagId required" }, { status: 400 })
  }

  const { error } = await supabase.from("document_tags").delete().eq("document_id", id).eq("tag_id", tagId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAuditEvent({
    action: "TAG_REMOVED",
    resourceType: "document",
    resourceId: id,
    details: { tagId },
  })

  return NextResponse.json({ success: true })
}
