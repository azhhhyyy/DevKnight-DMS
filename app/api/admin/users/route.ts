import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, getUserRole, setUserRole, canManageUsers } from "@/lib/auth"
import type { UserRole } from "@/lib/types"

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

    // Get all user roles
    const { data: roles } = await supabase.from("user_roles").select("user_id, role, created_at")

    // Create a map of user_id to role
    const roleMap = new Map(roles?.map((r) => [r.user_id, { role: r.role, created_at: r.created_at }]) || [])

    // For now, return the roles we have (in production, you'd join with auth.users via admin API)
    const users =
      roles?.map((r) => ({
        id: r.user_id,
        email: `User ${r.user_id.slice(0, 8)}...`, // Placeholder - in production use admin API
        role: r.role as UserRole,
        created_at: r.created_at,
      })) || []

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Users fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = await getUserRole(user.id)
    if (!canManageUsers(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userId, role: newRole } = await request.json()

    if (!userId || !newRole || !["viewer", "editor", "admin"].includes(newRole)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    await setUserRole(userId, newRole as UserRole)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Role update error:", error)
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
  }
}
