import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { filename } = await request.json()

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 })
  }

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a document naming assistant. Analyze this filename and suggest a properly formatted name following the convention: DKC-[TYPE]-[COMPANY]-[ID]-[DDMMYYYY]

Current filename: "${filename}"

Rules:
- TYPE should be a 2-3 letter code: INV (Invoice), CTR (Contract), PO (Purchase Order), RPT (Report), LTR (Letter), MEM (Memo), REC (Receipt), QUO (Quote)
- COMPANY should be the company name without spaces (use camelCase or remove spaces)
- ID should be a unique identifier from the document (invoice number, contract number, etc.)
- DATE should be in DDMMYYYY format

Respond ONLY with a JSON object in this exact format, no additional text:
{
  "suggested": "DKC-TYPE-Company-ID-DDMMYYYY",
  "confidence": 0.85,
  "breakdown": {
    "type": "INV",
    "company": "CompanyName",
    "serial": "123456",
    "date": "02122025"
  },
  "reasoning": "Brief explanation of choices"
}`,
    })

    const suggestion = JSON.parse(text)
    return NextResponse.json({
      original: filename,
      ...suggestion,
    })
  } catch (error) {
    console.error("AI rename error:", error)
    return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 500 })
  }
}
