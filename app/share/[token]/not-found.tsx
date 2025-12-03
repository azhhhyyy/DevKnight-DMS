import { FileX } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ShareNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <FileX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Link Not Found</CardTitle>
          <CardDescription>This share link doesn&apos;t exist or has been revoked.</CardDescription>
          <Button variant="outline" asChild className="mt-4 bg-transparent">
            <Link href="/">Go to Dashboard</Link>
          </Button>
        </CardHeader>
      </Card>
    </div>
  )
}
