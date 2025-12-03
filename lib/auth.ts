import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/lib/types"

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = await createClient()

  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle()

  // Default to viewer if no role is set
  return (data?.role as UserRole) || "viewer"
}

export async function setUserRole(userId: string, role: UserRole) {
  const supabase = await createClient()

  const { error } = await supabase.from("user_roles").upsert(
    {
      user_id: userId,
      role,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  )

  if (error) {
    throw new Error("Failed to set user role")
  }
}

export function canUpload(role: UserRole): boolean {
  return role === "editor" || role === "admin"
}

export function canDelete(role: UserRole): boolean {
  return role === "editor" || role === "admin"
}

export function canManageUsers(role: UserRole): boolean {
  return role === "admin"
}

export function canAccessQuarantine(role: UserRole): boolean {
  return role === "editor" || role === "admin"
}

export function canAccessAuditLogs(role: UserRole): boolean {
  return role === "admin"
}
