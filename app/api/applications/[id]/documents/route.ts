import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

const BUCKET = "application-documents";

const ALLOWED_DOCUMENT_TYPES = [
  "CV",
  "ID",
  "QUALIFICATION",
  "PROOF_OF_ADDRESS",
  "OTHER",
] as const;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function getExtension(filename: string) {
  const lastDot = filename.lastIndexOf(".");

  if (lastDot === -1) {
    return "";
  }

  return filename.slice(lastDot).toLowerCase();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: applicationId } = await params;

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required." },
        { status: 400 },
      );
    }

    const formData = await request.formData();

    const documentType = formData.get("document_type");
    const file = formData.get("file");

    if (
      typeof documentType !== "string" ||
      !ALLOWED_DOCUMENT_TYPES.includes(
        documentType as (typeof ALLOWED_DOCUMENT_TYPES)[number],
      )
    ) {
      return NextResponse.json(
        { error: "Invalid document type." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A document file is required." },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The uploaded file is empty." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must not exceed 10 MB." },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload PDF, JPG, PNG, DOC or DOCX.",
        },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Verify that the application exists.
    const { data: application, error: applicationError } =
      await supabase
        .from("applications")
        .select("id")
        .eq("id", applicationId)
        .maybeSingle();

    if (applicationError) {
      console.error(
        "Application lookup error:",
        applicationError,
      );

      return NextResponse.json(
        { error: "Unable to verify application." },
        { status: 500 },
      );
    }

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 },
      );
    }

    const extension = getExtension(file.name);

    const storagePath =
      `${applicationId}/${documentType}/${randomUUID()}${extension}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload document to the private Supabase bucket.
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Document upload error:", uploadError);

      return NextResponse.json(
        { error: "Unable to upload document." },
        { status: 500 },
      );
    }

    // Store document metadata.
    const { data: document, error: documentError } =
      await supabase
        .from("application_documents")
        .insert({
          application_id: applicationId,
          document_type: documentType,
          original_filename: file.name,
          storage_path: storagePath,
          mime_type: file.type,
          file_size: file.size,
          verification_status: "PENDING",
        })
        .select()
        .single();

    if (documentError) {
      console.error(
        "Document metadata error:",
        documentError,
      );

      // Clean up uploaded file if database insert fails.
      await supabase.storage
        .from(BUCKET)
        .remove([storagePath]);

      return NextResponse.json(
        { error: "Unable to save document information." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        document,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Unexpected document upload error:",
      error,
    );

    return NextResponse.json(
      { error: "Unable to process document upload." },
      { status: 500 },
    );
  }
}
