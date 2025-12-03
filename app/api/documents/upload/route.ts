import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseFilename } from "@/lib/filename-parser"
import { logAuditEvent } from "@/lib/audit-logger"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const forceUpload = formData.get("forceUpload") === "true"
    const createVersion = formData.get("createVersion") === "true"
    const quarantine = formData.get("quarantine") === "true"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const supabase = await createClient()

    // Validate filename against naming convention
    const parseResult = parseFilename(file.name)

    if (!parseResult.success || !parseResult.data) {
      if (quarantine) {
        // Upload to blob storage and save to quarantine
        const blob = await put(`quarantine/${file.name}`, file, {
          access: "public",
        })

        const { data: quarantineDoc, error: qError } = await supabase
          .from("quarantine_documents")
          .insert({
            original_file_name: file.name,
            file_url: blob.url,
            file_size: file.size,
            file_type: file.type,
            error_message: parseResult.error || "Invalid filename format",
          })
          .select()
          .single()

        if (qError) {
          return NextResponse.json({ error: "Failed to quarantine document" }, { status: 500 })
        }

        await logAuditEvent({
          action: "quarantine.upload",
          resourceType: "quarantine",
          resourceId: quarantineDoc.id,
          details: { fileName: file.name, errorMessage: parseResult.error },
        })

        return NextResponse.json({
          success: true,
          isQuarantined: true,
          quarantineDocument: quarantineDoc,
          message: "Document saved to quarantine for manual review",
        })
      }

      return NextResponse.json(
        {
          error: parseResult.error || "Invalid filename",
          canQuarantine: true,
        },
        { status: 400 },
      )
    }

    const { data: existingDocs } = await supabase
      .from("documents")
      .select("*")
      .eq("doc_serial", parseResult.data.serial)
      .eq("is_latest", true)
      .limit(1)

    const existingDoc = existingDocs?.[0]

    if (existingDoc && !forceUpload && !createVersion) {
      return NextResponse.json(
        {
          error: "Duplicate document detected",
          isDuplicate: true,
          existingDocument: existingDoc,
          message: `A document with serial ${parseResult.data.serial} already exists`,
        },
        { status: 409 },
      )
    }

    // Upload to Vercel Blob
    const blob = await put(`documents/${file.name}`, file, {
      access: "public",
    })

    let newDocument

    if (existingDoc && createVersion) {
      // Mark old document as not latest
      await supabase.from("documents").update({ is_latest: false }).eq("id", existingDoc.id)

      // Create new version
      const { data, error: dbError } = await supabase
        .from("documents")
        .insert({
          file_name: file.name,
          file_url: blob.url,
          file_size: file.size,
          file_type: file.type,
          prefix: parseResult.data.prefix,
          doc_type: parseResult.data.type,
          company_name: parseResult.data.company,
          doc_serial: parseResult.data.serial,
          raw_date: parseResult.data.rawDate,
          iso_date: parseResult.data.isoDate.toISOString().split("T")[0],
          version: existingDoc.version + 1,
          parent_id: existingDoc.id,
          is_latest: true,
        })
        .select()
        .single()

      if (dbError) {
        return NextResponse.json({ error: "Failed to save document version" }, { status: 500 })
      }

      newDocument = data

      await logAuditEvent({
        action: "document.upload",
        resourceType: "document",
        resourceId: data.id,
        details: {
          fileName: file.name,
          version: data.version,
          previousVersionId: existingDoc.id,
        },
      })
    } else {
      // Save new document
      const { data, error: dbError } = await supabase
        .from("documents")
        .insert({
          file_name: file.name,
          file_url: blob.url,
          file_size: file.size,
          file_type: file.type,
          prefix: parseResult.data.prefix,
          doc_type: parseResult.data.type,
          company_name: parseResult.data.company,
          doc_serial: parseResult.data.serial,
          raw_date: parseResult.data.rawDate,
          iso_date: parseResult.data.isoDate.toISOString().split("T")[0],
          version: 1,
          is_latest: true,
        })
        .select()
        .single()

      if (dbError) {
        console.error("Database error:", dbError)
        return NextResponse.json({ error: "Failed to save document" }, { status: 500 })
      }

      newDocument = data

      await logAuditEvent({
        action: "document.upload",
        resourceType: "document",
        resourceId: data.id,
        details: { fileName: file.name },
      })
    }

    return NextResponse.json({
      success: true,
      document: newDocument,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
