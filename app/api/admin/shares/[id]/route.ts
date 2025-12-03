import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, getUserRole, canManageUsers } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit-logger"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = await getUserRole(user.id)
    if (!canManageUsers(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from("shared_links").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to revoke share link" }, { status: 500 })
    }

    await logAuditEvent({
      action: "share.revoke",
      resourceType: "share",
      resourceId: id,
      userId: user.id,
      userEmail: user.email,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Share revoke error:", error)
    return NextResponse.json({ error: "Failed to revoke share link" }, { status: 500 })
  }
}
