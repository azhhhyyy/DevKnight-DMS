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
  const roleColor = role === "admin" ? "text-amber-600 dark:text-amber-500" : role === "editor" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 sm:px-6 gap-4">
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <FileStack className="h-4 w-4 text-primary" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold tracking-tight text-foreground">DevKnight DMS</h1>
          </div>
        </Link>

        {/* Divider */}
        <div className="hidden h-6 w-px bg-border sm:block" />

        {/* Navigation Links */}
        <nav className="flex-1 hidden md:flex items-center gap-1">
          <NavLink href="/">Documents</NavLink>
          {canAccessQuarantine(role as any) && (
            <NavLink href="/quarantine">Quarantine</NavLink>
          )}
          {canAccessAuditLogs(role as any) && (
            <NavLink href="/admin/audit-logs">Audit Logs</NavLink>
          )}
          {canManageUsers(role as any) && (
            <>
              <NavLink href="/admin/shares">Shares</NavLink>
              <NavLink href="/admin/users">Users</NavLink>
            </>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Add ThemeToggle here if available later */}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 hover:bg-muted/50 rounded-full border border-transparent hover:border-border transition-all">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-medium block max-w-[120px] truncate">{user.email}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-border/60 shadow-lg shadow-black/5 bg-background/95 backdrop-blur-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Shield className="h-3 w-3 mr-1 text-primary" />
                      <span className={roleColor}>{roleLabel}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                {canManageUsers(role as any) && (
                  <>
                    <DropdownMenuItem asChild className="rounded-lg focus:bg-sidebar-accent">
                      <Link href="/admin/users" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2 opacity-70" />
                        Manage Users
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg focus:bg-sidebar-accent">
                      <Link href="/admin/shares" className="cursor-pointer">
                        <Link2 className="h-4 w-4 mr-2 opacity-70" />
                        Manage Shares
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                  </>
                )}
                <div className="p-1">
                  <LogoutButton />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  // Simple link wrapper, active state logic would ideally come from usePathname but this is server component.
  // We'll keep it simple or check if we can make it a client component for active states, 
  // but for now keeping it server-side compatible as per original.
  return (
    <Link
      href={href}
      className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all"
    >
      {children}
    </Link>
  )
}
