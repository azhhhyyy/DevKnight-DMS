import { FileStack, User, Shield, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/server"
import { getUserRole, canManageUsers, canAccessQuarantine, canAccessAuditLogs } from "@/lib/auth"
import Link from "next/link"
import { LogoutButton } from "./logout-button"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let role = "viewer"
  if (user) {
    role = await getUserRole(user.id)
  }

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)
  const roleColor = role === "admin" ? "text-amber-600" : role === "editor" ? "text-blue-600" : "text-muted-foreground"

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary">
            <FileStack className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">DevKnight DMS</h1>
            <p className="text-xs text-muted-foreground">Document Management System</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Documents
          </Link>
          {canAccessQuarantine(role as "viewer" | "editor" | "admin") && (
            <Link href="/quarantine" className="text-sm font-medium hover:text-primary transition-colors">
              Quarantine
            </Link>
          )}
          {canAccessAuditLogs(role as "viewer" | "editor" | "admin") && (
            <Link href="/admin/audit-logs" className="text-sm font-medium hover:text-primary transition-colors">
              Audit Logs
            </Link>
          )}
          {canManageUsers(role as "viewer" | "editor" | "admin") && (
            <Link href="/admin/shares" className="text-sm font-medium hover:text-primary transition-colors">
              Shares
            </Link>
          )}
          {canManageUsers(role as "viewer" | "editor" | "admin") && (
            <Link href="/admin/users" className="text-sm font-medium hover:text-primary transition-colors">
              Users
            </Link>
          )}
        </nav>

        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium truncate max-w-[150px]">{user.email}</p>
                  <p className={`text-xs ${roleColor}`}>
                    <Shield className="h-3 w-3 inline mr-1" />
                    {roleLabel}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className={`text-xs ${roleColor}`}>{roleLabel}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canManageUsers(role as "viewer" | "editor" | "admin") && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Manage Users
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/shares" className="cursor-pointer">
                      <Link2 className="h-4 w-4 mr-2" />
                      Manage Shares
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <LogoutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
