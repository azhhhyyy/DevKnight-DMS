import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, getUserRole, canManageUsers } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = await getUserRole(user.id)
    if (!canManageUsers(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const supabase = await createClient()

    const { data: shares, error } = await supabase
      .from("shared_links")
      .select(`
        id,
        token,
        expires_at,
        view_count,
        max_views,
        created_at,
        documents (
          file_name,
          company_name,
          doc_serial
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Shares fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch shares" }, { status: 500 })
    }

    return NextResponse.json({ shares })
  } catch (error) {
    console.error("Shares error:", error)
    return NextResponse.json({ error: "Failed to fetch shares" }, { status: 500 })
  }
}
