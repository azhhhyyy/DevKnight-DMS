import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET all tags
export async function GET() {
  const supabase = await createClient()

  const { data: tags, error } = await supabase.from("tags").select("*").order("name", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tags })
}

// POST create new tag
export async function POST(request: Request) {
  const supabase = await createClient()
  const { name, color } = await request.json()

  if (!name) {
    return NextResponse.json({ error: "Tag name is required" }, { status: 400 })
  }

  const { data: tag, error } = await supabase
    .from("tags")
    .insert({ name: name.trim(), color: color || "#6b7280" })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Tag already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tag })
}
