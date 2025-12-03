import { createClient } from "@/lib/supabase/server"

export type AuditAction =
  | "document.upload"
  | "document.view"
  | "document.download"
  | "document.delete"
  | "document.share"
  | "quarantine.upload"
  | "quarantine.recover"
  | "quarantine.delete"
  | "share.create"
  | "share.access"
  | "share.revoke"

export interface AuditLogParams {
  action: AuditAction
  resourceType: "document" | "quarantine" | "share"
  resourceId?: string
  details?: Record<string, unknown>
  userId?: string
  userEmail?: string
}

export async function logAuditEvent(params: AuditLogParams) {
  try {
    const supabase = await createClient()

    await supabase.from("audit_logs").insert({
      user_id: params.userId || null,
      user_email: params.userEmail || null,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId || null,
      details: params.details || null,
      ip_address: null, // Can be extracted from request headers if needed
    })
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error("Audit logging failed:", error)
  }
}
