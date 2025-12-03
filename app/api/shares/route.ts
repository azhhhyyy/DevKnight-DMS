import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit-logger"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { documentId, expiresInDays = 7, maxViews, pin } = await request.json()

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify document exists
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("id, file_name")
      .eq("id", documentId)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Generate unique token
    const token = randomBytes(32).toString("hex")

    // Calculate expiry date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // Create share link
    const { data: shareLink, error: shareError } = await supabase
      .from("shared_links")
      .insert({
        document_id: documentId,
        token,
        expires_at: expiresAt.toISOString(),
        max_views: maxViews || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (shareError) {
      console.error("Share creation error:", shareError)
      return NextResponse.json({ error: "Failed to create share link" }, { status: 500 })
    }

    await logAuditEvent({
      action: "share.create",
      resourceType: "share",
      resourceId: shareLink.id,
      userId: user.id,
      userEmail: user.email,
      details: { documentId, expiresInDays, fileName: doc.file_name },
    })

    return NextResponse.json({
      success: true,
      token,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("Share error:", error)
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 })
  }
}
