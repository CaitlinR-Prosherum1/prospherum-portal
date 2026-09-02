import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VERIFICATION_STATUSES = [
  "PENDING",
  "VERIFIED",
  "REJECTED",
] as const;

type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; documentId: string }>;
  },
) {
  try {
    const { id: applicationId, documentId } = await params;

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const admin = createAdminClient();

    const { data: staff, error: staffError } = await admin
      .from("staff_profiles")
      .select("id, first_name, last_name, role, active")
      .eq("id", user.id)
      .eq("active", true)
      .single();

    if (staffError || !staff) {
      return NextResponse.json(
        { error: "Staff access required." },
        { status: 403 },
      );
    }

    const { data: document, error: documentError } = await admin
      .from("application_documents")
      .select(
        "id, application_id, document_type, original_filename, storage_path, mime_type, file_size, verification_status, uploaded_at, verified_at, verified_by",
      )
      .eq("id", documentId)
      .eq("application_id", applicationId)
      .single();

    if (documentError || !document) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 },
      );
    }

    const { data: signedUrlData, error: signedUrlError } =
      await admin.storage
        .from("application-documents")
        .createSignedUrl(document.storage_path, 300);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Signed URL error:", signedUrlError);

      return NextResponse.json(
        { error: "Unable to create a secure document link." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      document,
      url: signedUrlData.signedUrl,
      expires_in: 300,
    });
  } catch (error) {
    console.error("Document viewing error:", error);

    return NextResponse.json(
      { error: "Unable to open document." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; documentId: string }>;
  },
) {
  try {
    const { id: applicationId, documentId } = await params;

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const admin = createAdminClient();

    const { data: staff, error: staffError } = await admin
      .from("staff_profiles")
      .select("id, first_name, last_name, role, active")
      .eq("id", user.id)
      .eq("active", true)
      .single();

    if (staffError || !staff) {
      return NextResponse.json(
        { error: "Staff access required." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const status = String(
      body.status || "",
    ).toUpperCase() as VerificationStatus;

    const rejectionReason =
      typeof body.rejection_reason === "string"
        ? body.rejection_reason.trim()
        : null;

    if (!VERIFICATION_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid verification status. Use PENDING, VERIFIED, or REJECTED.",
        },
        { status: 400 },
      );
    }

    if (status === "REJECTED" && !rejectionReason) {
      return NextResponse.json(
        { error: "A rejection reason is required." },
        { status: 400 },
      );
    }

    const { data: document, error: documentError } = await admin
      .from("application_documents")
      .select(
        "id, application_id, document_type, original_filename, verification_status",
      )
      .eq("id", documentId)
      .eq("application_id", applicationId)
      .single();

    if (documentError || !document) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 },
      );
    }

    const previousStatus = document.verification_status;

    const { data: updatedDocument, error: updateError } = await admin
      .from("application_documents")
      .update({
        verification_status: status,
        verified_at:
          status === "PENDING" ? null : new Date().toISOString(),
        verified_by: status === "PENDING" ? null : user.id,
      })
      .eq("id", documentId)
      .eq("application_id", applicationId)
      .select(
        "id, application_id, document_type, original_filename, storage_path, mime_type, file_size, verification_status, uploaded_at, verified_at, verified_by",
      )
      .single();

    if (updateError) {
      console.error(
        "Document verification update error:",
        updateError,
      );

      return NextResponse.json(
        {
          error:
            updateError.message ||
            "Unable to update document verification.",
        },
        { status: 500 },
      );
    }

    const action =
      status === "VERIFIED"
        ? "DOCUMENT_VERIFIED"
        : status === "REJECTED"
          ? "DOCUMENT_REJECTED"
          : "DOCUMENT_VERIFICATION_RESET";

    const details = {
      document_id: document.id,
      document_type: document.document_type,
      original_filename: document.original_filename,
      previous_verification_status: previousStatus,
      new_verification_status: status,
      ...(rejectionReason
        ? { rejection_reason: rejectionReason }
        : {}),
    };

    const { error: auditError } = await admin
      .from("application_audit_log")
      .insert({
        application_id: applicationId,
        staff_id: user.id,
        action,
        details,
      });

    if (auditError) {
      console.error(
        "Document audit insert error:",
        auditError,
      );

      return NextResponse.json(
        {
          error:
            "Document was updated, but the audit record could not be created.",
          document: updatedDocument,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      document: updatedDocument,
      staff,
    });
  } catch (error) {
    console.error("Document verification error:", error);

    return NextResponse.json(
      { error: "Unable to update document verification." },
      { status: 500 },
    );
  }
}
