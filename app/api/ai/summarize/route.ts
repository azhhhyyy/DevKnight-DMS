import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logAuditEvent } from "@/lib/audit-logger"

export async function POST(request: Request) {
  const { documentId, content } = await request.json()

  if (!documentId) {
    return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
  }

  try {
    const { text: summary } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Summarize the following document content in 2-3 concise sentences. Focus on key information like dates, amounts, parties involved, and main purpose.

${content || "Document content not available. Generate a placeholder summary based on typical business documents."}

Provide ONLY the summary, no additional text or formatting.`,
    })

    // Save summary to database
    const supabase = await createClient()
    const { error } = await supabase.from("documents").update({ summary }).eq("id", documentId)

    if (error) {
      console.error("Failed to save summary:", error)
    }

    await logAuditEvent({
      action: "DOCUMENT_SUMMARIZED",
      resourceType: "document",
      resourceId: documentId,
      details: { summaryLength: summary.length },
    })

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("AI summarize error:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
