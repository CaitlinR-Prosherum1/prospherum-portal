import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const STATUS_OPTIONS = [
  "NEW",
  "UNDER_REVIEW",
  "REQUIRES_INFORMATION",
  "SHORTLISTED",
  "SELECTED",
  "NOT_SELECTED",
  "ARCHIVED",
] as const;

type Status = (typeof STATUS_OPTIONS)[number];

async function getAuthenticatedStaff() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      user: null,
      profile: null,
      error: NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      ),
    };
  }

  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("staff_profiles")
    .select("id, first_name, last_name, role, active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Staff profile lookup error:", profileError);

    return {
      user: null,
      profile: null,
      error: NextResponse.json(
        { error: "Unable to verify staff profile." },
        { status: 500 },
      ),
    };
  }

  if (!profile || !profile.active) {
    return {
      user: null,
      profile: null,
      error: NextResponse.json(
        { error: "Staff access is inactive." },
        { status: 403 },
      ),
    };
  }

  return {
    user,
    profile,
    error: null,
  };
}

export async function GET(
  _request: Request,
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

    const { user, profile, error } = await getAuthenticatedStaff();

    if (error) {
      return error;
    }

    const admin = createAdminClient();

    const [
      applicationResult,
      documentsResult,
      notesResult,
      auditResult,
    ] = await Promise.all([
      admin
        .from("applications")
        .select("*")
        .eq("id", applicationId)
        .maybeSingle(),

      admin
        .from("application_documents")
        .select("*")
        .eq("application_id", applicationId)
        .order("uploaded_at", { ascending: false }),

      admin
        .from("application_notes")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false }),

      admin
        .from("application_audit_log")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false }),
    ]);

    if (applicationResult.error) {
      console.error(
        "Application lookup error:",
        applicationResult.error,
      );

      return NextResponse.json(
        { error: "Unable to load the application." },
        { status: 500 },
      );
    }

    if (!applicationResult.data) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 },
      );
    }

    if (documentsResult.error) {
      console.error(
        "Document lookup error:",
        documentsResult.error,
      );

      return NextResponse.json(
        { error: "Unable to load application documents." },
        { status: 500 },
      );
    }

    if (notesResult.error) {
      console.error(
        "Notes lookup error:",
        notesResult.error,
      );

      return NextResponse.json(
        { error: "Unable to load application notes." },
        { status: 500 },
      );
    }

    if (auditResult.error) {
      console.error(
        "Audit lookup error:",
        auditResult.error,
      );

      return NextResponse.json(
        { error: "Unable to load application audit history." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      authenticated: true,
      staff: {
        user_id: user!.id,
        first_name: profile!.first_name,
        last_name: profile!.last_name,
        role: profile!.role,
        active: profile!.active,
      },
      application: applicationResult.data,
      documents: documentsResult.data || [],
      notes: notesResult.data || [],
      audit_logs: auditResult.data || [],
    });
  } catch (error) {
    console.error(
      "Unexpected application details error:",
      error,
    );

    return NextResponse.json(
      { error: "Unable to load application details." },
      { status: 500 },
    );
  }
}

export async function PATCH(
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

    const { user, profile, error } = await getAuthenticatedStaff();

    if (error) {
      return error;
    }

    const body = await request.json();
    const requestedStatus = body?.status;

    if (
      typeof requestedStatus !== "string" ||
      !STATUS_OPTIONS.includes(requestedStatus as Status)
    ) {
      return NextResponse.json(
        {
          error: "Invalid application status.",
          allowed_statuses: STATUS_OPTIONS,
        },
        { status: 400 },
      );
    }

    const newStatus = requestedStatus as Status;
    const admin = createAdminClient();

    const { data: application, error: applicationLookupError } =
      await admin
        .from("applications")
        .select("id, reference_number, status")
        .eq("id", applicationId)
        .maybeSingle();

    if (applicationLookupError) {
      console.error(
        "Application status lookup error:",
        applicationLookupError,
      );

      return NextResponse.json(
        { error: "Unable to load the application." },
        { status: 500 },
      );
    }

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 },
      );
    }

    const previousStatus = application.status;

    if (previousStatus === newStatus) {
      return NextResponse.json({
        success: true,
        changed: false,
        application,
      });
    }

    const now = new Date().toISOString();

    const { data: updatedApplication, error: updateError } =
      await admin
        .from("applications")
        .update({
          status: newStatus,
          updated_at: now,
        })
        .eq("id", applicationId)
        .select("*")
        .single();

    if (updateError) {
      console.error(
        "Application status update error:",
        updateError,
      );

      return NextResponse.json(
        { error: "Unable to update application status." },
        { status: 500 },
      );
    }

    const { error: auditError } = await admin
      .from("application_audit_log")
      .insert({
        application_id: applicationId,
        staff_id: user!.id,
        action: "STATUS_CHANGED",
        previous_status: previousStatus,
        new_status: newStatus,
        details: {
          source: "staff_application_details",
          staff_role: profile!.role,
        },
      });

    if (auditError) {
      console.error(
        "Status audit insert error:",
        auditError,
      );

      return NextResponse.json(
        {
          success: true,
          changed: true,
          warning:
            "Application status was updated, but the audit record could not be created.",
          application: updatedApplication,
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      success: true,
      changed: true,
      application: updatedApplication,
    });
  } catch (error) {
    console.error(
      "Unexpected application status update error:",
      error,
    );

    return NextResponse.json(
      { error: "Unable to update application status." },
      { status: 500 },
    );
  }
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

    const { user, error } = await getAuthenticatedStaff();

    if (error) {
      return error;
    }

    const body = await request.json();
    const note = body?.note;

    if (typeof note !== "string" || !note.trim()) {
      return NextResponse.json(
        { error: "A note is required." },
        { status: 400 },
      );
    }

    const trimmedNote = note.trim();

    if (trimmedNote.length > 5000) {
      return NextResponse.json(
        { error: "The note cannot exceed 5000 characters." },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    const { data: application, error: applicationError } =
      await admin
        .from("applications")
        .select("id")
        .eq("id", applicationId)
        .maybeSingle();

    if (applicationError) {
      console.error(
        "Application note lookup error:",
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

    const { data: createdNote, error: noteError } = await admin
      .from("application_notes")
      .insert({
        application_id: applicationId,
        staff_id: user!.id,
        note: trimmedNote,
      })
      .select("*")
      .single();

    if (noteError) {
      console.error("Note insert error:", noteError);

      return NextResponse.json(
        { error: "Unable to add the note." },
        { status: 500 },
      );
    }

    const { error: auditError } = await admin
      .from("application_audit_log")
      .insert({
        application_id: applicationId,
        staff_id: user!.id,
        action: "NOTE_ADDED",
        previous_status: null,
        new_status: null,
        details: {
          source: "staff_application_details",
        },
      });

    if (auditError) {
      console.error(
        "Note audit insert error:",
        auditError,
      );
    }

    return NextResponse.json(
      {
        success: true,
        note: createdNote,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Unexpected application note error:",
      error,
    );

    return NextResponse.json(
      { error: "Unable to add application note." },
      { status: 500 },
    );
  }
}
