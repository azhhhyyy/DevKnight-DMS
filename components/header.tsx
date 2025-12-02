"use client"

import { FileStack } from "lucide-react"

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center h-16 px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary">
            <FileStack className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">DevKnight DMS</h1>
            <p className="text-xs text-muted-foreground">Document Management System</p>
          </div>
        </div>
      </div>
    </header>
  )
}
