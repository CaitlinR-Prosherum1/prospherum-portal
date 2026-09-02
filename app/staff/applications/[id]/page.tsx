"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Application = {
  id: string;
  reference_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  id_number: string | null;
  date_of_birth: string | null;

  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;

  highest_qualification: string | null;
  institution: string | null;
  field_of_study: string | null;

  programme_applied_for: string | null;
  application_source: string | null;

  status: string;

  created_at: string;
  updated_at: string | null;
};

type ApplicationDocument = {
  id: string;
  application_id: string;
  document_type: string;
  original_filename: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  verification_status: string;
  uploaded_at: string;
  verified_at: string | null;
  verified_by?: string | null;
};

type ApplicationNote = {
  id: string;
  application_id: string;
  staff_id: string;
  note: string;
  created_at: string;
};

type AuditLog = {
  id: string;
  application_id: string | null;
  staff_id: string | null;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

type StaffProfile = {
  id: string;
  first_name: string;
  last_name: string;
  role: "ADMIN" | "MANAGER" | "REVIEWER";
  active: boolean;
};

const STATUS_OPTIONS = [
  "NEW",
  "UNDER_REVIEW",
  "REQUIRES_INFORMATION",
  "SHORTLISTED",
  "SELECTED",
  "NOT_SELECTED",
  "ARCHIVED",
];

const VERIFICATION_STATUSES = [
  "PENDING",
  "VERIFIED",
  "REJECTED",
];

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const applicationId = String(params.id);

  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [staff, setStaff] = useState<StaffProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(
    null,
  );
  const [updatingDocumentId, setUpdatingDocumentId] = useState<string | null>(
    null,
  );

  const [selectedStatus, setSelectedStatus] = useState("");
  const [newNote, setNewNote] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [rejectionDocument, setRejectionDocument] =
    useState<ApplicationDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    async function loadApplication() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `/api/staff/applications/${applicationId}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (response.status === 401 || response.status === 403) {
          router.replace("/staff/login");
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          console.error("Application loading error:", result);

          setErrorMessage(
            result.error || "Unable to load the application.",
          );

          return;
        }

        setStaff(result.staff);
        setApplication(result.application);
        setDocuments(result.documents || []);
        setNotes(result.notes || []);
        setAuditLogs(result.audit_logs || []);
        setSelectedStatus(result.application.status);
      } catch (error) {
        console.error("Application loading error:", error);
        setErrorMessage("Unable to load application details.");
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [applicationId, router]);

  async function updateStatus() {
    if (!application || !staff) {
      return;
    }

    if (selectedStatus === application.status) {
      return;
    }

    setSavingStatus(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/staff/applications/${application.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: selectedStatus,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Status update error:", result);

        setErrorMessage(
          result.error || "Unable to update application status.",
        );

        return;
      }

      setApplication((current) =>
        current
          ? {
              ...current,
              status: result.application?.status ?? selectedStatus,
              updated_at:
                result.application?.updated_at ??
                new Date().toISOString(),
            }
          : current,
      );

      setSelectedStatus(
        result.application?.status ?? selectedStatus,
      );

      setSuccessMessage("Application status updated.");

      await reloadAuditLogs();
    } catch (error) {
      console.error("Status update error:", error);
      setErrorMessage("Unable to update application status.");
    } finally {
      setSavingStatus(false);
    }
  }

  async function addNote() {
    if (!application || !staff || !newNote.trim()) {
      return;
    }

    setAddingNote(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const noteText = newNote.trim();

      const response = await fetch(
        `/api/staff/applications/${application.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            note: noteText,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Note insert error:", result);

        setErrorMessage(
          result.error || "Unable to add the note.",
        );

        return;
      }

      setNewNote("");
      setSuccessMessage("Note added.");

      await reloadNotes();
      await reloadAuditLogs();
    } catch (error) {
      console.error("Note error:", error);
      setErrorMessage("Unable to add the note.");
    } finally {
      setAddingNote(false);
    }
  }

  async function viewDocument(document: ApplicationDocument) {
    if (!application) {
      return;
    }

    setViewingDocumentId(document.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/staff/applications/${application.id}/documents/${document.id}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        router.replace("/staff/login");
        return;
      }

      if (!response.ok || !result.url) {
        console.error("Document viewing error:", result);

        setErrorMessage(
          result.error || "Unable to open this document.",
        );

        return;
      }

      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Document viewing error:", error);
      setErrorMessage("Unable to open this document.");
    } finally {
      setViewingDocumentId(null);
    }
  }

  async function updateDocumentVerification(
    document: ApplicationDocument,
    status: string,
    reason?: string,
  ) {
    if (!application) {
      return;
    }

    if (!VERIFICATION_STATUSES.includes(status)) {
      return;
    }

    setUpdatingDocumentId(document.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/staff/applications/${application.id}/documents/${document.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status,
            rejection_reason: reason || undefined,
          }),
        },
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        router.replace("/staff/login");
        return;
      }

      if (!response.ok) {
        console.error("Document verification error:", result);

        setErrorMessage(
          result.error || "Unable to update document verification.",
        );

        return;
      }

      const updatedDocument = result.document;

      setDocuments((currentDocuments) =>
        currentDocuments.map((currentDocument) =>
          currentDocument.id === document.id
            ? {
                ...currentDocument,
                ...updatedDocument,
              }
            : currentDocument,
        ),
      );

      if (status === "VERIFIED") {
        setSuccessMessage(
          `${formatDocumentType(document.document_type)} verified successfully.`,
        );
      } else if (status === "REJECTED") {
        setSuccessMessage(
          `${formatDocumentType(document.document_type)} rejected.`,
        );
      } else {
        setSuccessMessage(
          `${formatDocumentType(document.document_type)} returned to pending.`,
        );
      }

      await reloadAuditLogs();
    } catch (error) {
      console.error("Document verification error:", error);
      setErrorMessage("Unable to update document verification.");
    } finally {
      setUpdatingDocumentId(null);
    }
  }

  function openRejectionDialog(document: ApplicationDocument) {
    setRejectionDocument(document);
    setRejectionReason("");
    setErrorMessage("");
    setSuccessMessage("");
  }

  function closeRejectionDialog() {
    if (updatingDocumentId) {
      return;
    }

    setRejectionDocument(null);
    setRejectionReason("");
  }

  async function confirmRejection() {
    if (!rejectionDocument) {
      return;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      setErrorMessage("A rejection reason is required.");
      return;
    }

    await updateDocumentVerification(
      rejectionDocument,
      "REJECTED",
      reason,
    );

    setRejectionDocument(null);
    setRejectionReason("");
  }

  async function reloadNotes() {
    try {
      const response = await fetch(
        `/api/staff/applications/${applicationId}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      setNotes(result.notes || []);
    } catch (error) {
      console.error("Notes reload error:", error);
    }
  }

  async function reloadAuditLogs() {
    try {
      const response = await fetch(
        `/api/staff/applications/${applicationId}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      setAuditLogs(result.audit_logs || []);
    } catch (error) {
      console.error("Audit reload error:", error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/staff/login";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-green-500" />
            <p className="text-sm text-gray-400">
              Loading application...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="min-h-screen bg-black text-white">
        <header className="border-b border-white/10 bg-black">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <img
              src="/branding/prospherum-logo.png"
              alt="Prospherum Skills Academy"
              className="h-12 w-auto"
            />

            <Link
              href="/staff"
              className="text-sm text-green-400 hover:text-green-300"
            >
              Back to dashboard
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <h1 className="text-xl font-semibold">
              Application unavailable
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              {errorMessage ||
                "The requested application could not be found."}
            </p>

            <Link
              href="/staff"
              className="mt-6 inline-flex rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold hover:bg-green-500"
            >
              Return to dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <img
              src="/branding/prospherum-logo.png"
              alt="Prospherum Skills Academy"
              className="h-12 w-auto object-contain"
            />

            <div className="hidden border-l border-white/10 pl-4 sm:block">
              <p className="text-xs uppercase tracking-[0.18em] text-green-400">
                Staff Portal
              </p>

              <p className="text-sm font-medium">
                Application Review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/staff"
              className="hidden rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:border-green-500/40 hover:text-green-300 sm:block"
            >
              Dashboard
            </Link>

            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/staff"
            className="text-sm text-gray-500 transition hover:text-green-400"
          >
            ← Back to applications
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-green-400">
              Learner Application
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">
                {application.first_name} {application.last_name}
              </h1>

              <StatusBadge status={application.status} />
            </div>

            <p className="mt-2 font-mono text-sm text-gray-500">
              {application.reference_number}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <label
              htmlFor="status"
              className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Application status
            </label>

            <div className="flex gap-2">
              <select
                id="status"
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(event.target.value)
                }
                className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-green-500"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={updateStatus}
                disabled={
                  savingStatus ||
                  selectedStatus === application.status
                }
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {savingStatus ? "Saving..." : "Update"}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-sm text-green-300">
            {successMessage}
          </div>
        )}

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left / main content */}
          <div className="space-y-6 lg:col-span-2">
            <Section title="Personal Information">
              <div className="grid gap-5 sm:grid-cols-2">
                <InfoItem
                  label="First name"
                  value={application.first_name}
                />

                <InfoItem
                  label="Last name"
                  value={application.last_name}
                />

                <InfoItem
                  label="Email"
                  value={application.email}
                />

                <InfoItem
                  label="Phone"
                  value={application.phone}
                />

                <InfoItem
                  label="ID number"
                  value={application.id_number}
                />

                <InfoItem
                  label="Date of birth"
                  value={formatDateOfBirth(application.date_of_birth)}
                />
              </div>
            </Section>

            <Section title="Address">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <InfoItem
                    label="Address"
                    value={application.address}
                  />
                </div>

                <InfoItem
                  label="City"
                  value={application.city}
                />

                <InfoItem
                  label="Province"
                  value={application.province}
                />

                <InfoItem
                  label="Postal code"
                  value={application.postal_code}
                />
              </div>
            </Section>

            <Section title="Education & Programme">
              <div className="grid gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Highest qualification"
                  value={application.highest_qualification}
                />

                <InfoItem
                  label="Institution"
                  value={application.institution}
                />

                <InfoItem
                  label="Field of study"
                  value={application.field_of_study}
                />

                <InfoItem
                  label="Programme applied for"
                  value={application.programme_applied_for}
                />

                <InfoItem
                  label="Application source"
                  value={application.application_source}
                />
              </div>
            </Section>

            <Section title="Documents">
              {documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
                  <p className="text-sm text-gray-500">
                    No documents have been uploaded for this application.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((document) => (
                    <DocumentRow
                      key={document.id}
                      document={document}
                      viewing={viewingDocumentId === document.id}
                      updating={
                        updatingDocumentId === document.id
                      }
                      onView={() => viewDocument(document)}
                      onVerify={() =>
                        updateDocumentVerification(
                          document,
                          "VERIFIED",
                        )
                      }
                      onReject={() =>
                        openRejectionDialog(document)
                      }
                      onReset={() =>
                        updateDocumentVerification(
                          document,
                          "PENDING",
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </Section>

            <Section title="Staff Notes">
              <div className="space-y-4">
                <textarea
                  value={newNote}
                  onChange={(event) =>
                    setNewNote(event.target.value)
                  }
                  placeholder="Add an internal note about this application..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-green-500"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addNote}
                    disabled={
                      addingNote || !newNote.trim()
                    }
                    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {addingNote ? "Adding..." : "Add note"}
                  </button>
                </div>

                {notes.length === 0 ? (
                  <p className="py-5 text-center text-sm text-gray-600">
                    No staff notes yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                      >
                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-300">
                          {note.note}
                        </p>

                        <p className="mt-3 text-xs text-gray-600">
                          {formatDateTime(note.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-6">
            <Section title="Application Summary">
              <div className="space-y-4">
                <SummaryItem
                  label="Reference"
                  value={application.reference_number}
                  mono
                />

                <SummaryItem
                  label="Status"
                  value={formatStatus(application.status)}
                />

                <SummaryItem
                  label="Submitted"
                  value={formatDateTime(application.created_at)}
                />

                <SummaryItem
                  label="Last updated"
                  value={
                    application.updated_at
                      ? formatDateTime(application.updated_at)
                      : "—"
                  }
                />
              </div>
            </Section>

            <Section title="Document Status">
              <div className="space-y-3">
                {documents.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No documents uploaded.
                  </p>
                ) : (
                  documents.map((document) => (
                    <div
                      key={document.id}
                      className="rounded-lg border border-white/5 bg-white/[0.015] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-300">
                            {formatDocumentType(
                              document.document_type,
                            )}
                          </p>

                          <p className="truncate text-xs text-gray-600">
                            {document.original_filename}
                          </p>
                        </div>

                        <VerificationBadge
                          status={document.verification_status}
                        />
                      </div>

                      {getRejectionReason(document, auditLogs) ? (
                        <div className="mt-3 rounded-lg border border-red-500/10 bg-red-500/5 px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                            Rejection reason
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-300/80">
                            {getRejectionReason(
                              document,
                              auditLogs,
                            )}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </Section>

            <Section title="Audit History">
              {auditLogs.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No audit activity recorded yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border-l border-green-500/30 pl-4"
                    >
                      <p className="text-sm font-medium text-gray-300">
                        {formatAuditAction(log.action)}
                      </p>

                      {log.previous_status ||
                      log.new_status ? (
                        <p className="mt-1 text-xs text-gray-500">
                          {log.previous_status
                            ? formatStatus(
                                log.previous_status,
                              )
                            : "—"}{" "}
                          →{" "}
                          {log.new_status
                            ? formatStatus(log.new_status)
                            : "—"}
                        </p>
                      ) : null}

                      {getAuditDocumentName(log) ? (
                        <p className="mt-1 text-xs text-gray-500">
                          Document:{" "}
                          {getAuditDocumentName(log)}
                        </p>
                      ) : null}

                      {getAuditRejectionReason(log) ? (
                        <div className="mt-2 rounded-lg border border-red-500/10 bg-red-500/5 px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                            Rejection reason
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-300/80">
                            {getAuditRejectionReason(log)}
                          </p>
                        </div>
                      ) : null}

                      <p className="mt-1 text-xs text-gray-600">
                        {formatDateTime(log.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </aside>
        </div>
      </div>

      {/* Rejection dialog */}
      {rejectionDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rejection-dialog-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-red-400">
                  Document Review
                </p>

                <h2
                  id="rejection-dialog-title"
                  className="mt-1 text-xl font-semibold text-white"
                >
                  Reject document
                </h2>
              </div>

              <button
                type="button"
                onClick={closeRejectionDialog}
                disabled={Boolean(updatingDocumentId)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-sm font-medium text-white">
                {formatDocumentType(
                  rejectionDocument.document_type,
                )}
              </p>

              <p className="mt-1 truncate text-xs text-gray-500">
                {rejectionDocument.original_filename}
              </p>
            </div>

            <div className="mt-5">
              <label
                htmlFor="rejection-reason"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Rejection reason
              </label>

              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(event) =>
                  setRejectionReason(event.target.value)
                }
                placeholder="Explain why this document cannot be accepted..."
                rows={5}
                maxLength={2000}
                autoFocus
                className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500"
              />

              <div className="mt-2 flex justify-between text-xs text-gray-600">
                <span>
                  A reason is required for rejection.
                </span>

                <span>
                  {rejectionReason.length}/2000
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeRejectionDialog}
                disabled={Boolean(updatingDocumentId)}
                className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmRejection}
                disabled={
                  Boolean(updatingDocumentId) ||
                  !rejectionReason.trim()
                }
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {updatingDocumentId
                  ? "Rejecting..."
                  : "Reject document"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl">
      <h2 className="mb-5 text-base font-semibold text-white">
        {title}
      </h2>

      {children}
    </section>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-gray-600">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm text-gray-300">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-gray-600">{label}</span>

      <span
        className={`text-right text-sm text-gray-300 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function DocumentRow({
  document,
  viewing,
  updating,
  onView,
  onVerify,
  onReject,
  onReset,
}: {
  document: ApplicationDocument;
  viewing: boolean;
  updating: boolean;
  onView: () => void;
  onVerify: () => void;
  onReject: () => void;
  onReset: () => void;
}) {
  const normalizedStatus =
    document.verification_status?.toUpperCase() || "PENDING";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black text-sm text-green-400">
            {getFileLabel(document.mime_type, document.original_filename)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-white">
                {formatDocumentType(document.document_type)}
              </p>

              <VerificationBadge
                status={document.verification_status}
              />
            </div>

            <p className="mt-1 truncate text-xs text-gray-500">
              {document.original_filename}
            </p>

            <p className="mt-1 text-xs text-gray-700">
              {formatFileSize(document.file_size)}
              {" • "}
              Uploaded {formatDateTime(document.uploaded_at)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <button
            type="button"
            onClick={onView}
            disabled={viewing || updating}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-green-500/40 hover:text-green-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {viewing ? "Opening..." : "View"}
          </button>

          {normalizedStatus !== "VERIFIED" ? (
            <button
              type="button"
              onClick={onVerify}
              disabled={updating || viewing}
              className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-300 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {updating ? "Saving..." : "Verify"}
            </button>
          ) : null}

          {normalizedStatus !== "REJECTED" ? (
            <button
              type="button"
              onClick={onReject}
              disabled={updating || viewing}
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reject
            </button>
          ) : null}

          {normalizedStatus !== "PENDING" ? (
            <button
              type="button"
              onClick={onReset}
              disabled={updating || viewing}
              className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-medium text-yellow-300 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>

      {normalizedStatus === "REJECTED" ? (
        <div className="mt-4 rounded-lg border border-red-500/10 bg-red-500/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
            Document rejected
          </p>

          <p className="mt-1 text-xs leading-5 text-red-300/80">
            Review the rejection reason in the Document Status panel
            or Audit History.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase() || "UNKNOWN";

  let classes = "border-white/10 bg-white/5 text-gray-300";

  if (normalized === "NEW") {
    classes = "border-blue-500/20 bg-blue-500/10 text-blue-300";
  } else if (normalized === "SCREENING") {
    classes =
      "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
  } else if (normalized === "ASSIGNED") {
    classes =
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-300";
  } else if (normalized === "UNDER_REVIEW") {
    classes =
      "border-purple-500/20 bg-purple-500/10 text-purple-300";
  } else if (normalized === "REQUIRES_INFORMATION") {
    classes =
      "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
  } else if (normalized === "SHORTLISTED") {
    classes =
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-300";
  } else if (normalized === "SELECTED") {
    classes =
      "border-green-500/20 bg-green-500/10 text-green-300";
  } else if (normalized === "NOT_SELECTED") {
    classes =
      "border-red-500/20 bg-red-500/10 text-red-300";
  } else if (normalized === "APPROVED") {
    classes =
      "border-green-500/20 bg-green-500/10 text-green-300";
  } else if (normalized === "REJECTED") {
    classes =
      "border-red-500/20 bg-red-500/10 text-red-300";
  } else if (normalized === "ARCHIVED") {
    classes =
      "border-gray-500/20 bg-gray-500/10 text-gray-400";
  }

  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      {formatStatus(normalized)}
    </span>
  );
}

function VerificationBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase() || "PENDING";

  let classes =
    "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";

  if (normalized === "VERIFIED") {
    classes =
      "border-green-500/20 bg-green-500/10 text-green-300";
  } else if (normalized === "REJECTED") {
    classes =
      "border-red-500/20 bg-red-500/10 text-red-300";
  }

  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium ${classes}`}
    >
      {formatStatus(normalized)}
    </span>
  );
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDocumentType(type: string) {
  const labels: Record<string, string> = {
    CV: "Curriculum Vitae",
    ID: "Identity Document",
    QUALIFICATION: "Qualification",
    PROOF_OF_ADDRESS: "Proof of Address",
    OTHER: "Supporting Document",
  };

  return labels[type] || formatStatus(type);
}

function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    STATUS_CHANGED: "Application status changed",
    APPLICATION_CREATED: "Application created",
    DOCUMENT_UPLOADED: "Document uploaded",
    NOTE_ADDED: "Staff note added",
    DOCUMENT_VERIFIED: "Document verified",
    DOCUMENT_REJECTED: "Document rejected",
    DOCUMENT_VERIFICATION_RESET:
      "Document verification reset",
  };

  return labels[action] || formatStatus(action);
}

function getAuditDocumentName(log: AuditLog) {
  const details = log.details;

  if (!details) {
    return null;
  }

  const filename = details.original_filename;

  if (typeof filename === "string" && filename.trim()) {
    return filename;
  }

  const documentType = details.document_type;

  if (typeof documentType === "string" && documentType.trim()) {
    return formatDocumentType(documentType);
  }

  return null;
}

function getAuditRejectionReason(log: AuditLog) {
  if (!log.details) {
    return null;
  }

  const reason = log.details.rejection_reason;

  return typeof reason === "string" && reason.trim()
    ? reason
    : null;
}

function getRejectionReason(
  document: ApplicationDocument,
  auditLogs: AuditLog[],
) {
  const matchingLogs = auditLogs.filter((log) => {
    if (log.action !== "DOCUMENT_REJECTED") {
      return false;
    }

    const documentId = log.details?.document_id;

    return documentId === document.id;
  });

  if (matchingLogs.length === 0) {
    return null;
  }

  return getAuditRejectionReason(matchingLogs[0]);
}

function getFileLabel(
  mimeType: string | null,
  filename: string,
) {
  const lowerMime = mimeType?.toLowerCase() || "";
  const lowerFilename = filename.toLowerCase();

  if (lowerMime.includes("pdf") || lowerFilename.endsWith(".pdf")) {
    return "PDF";
  }

  if (
    lowerMime.includes("word") ||
    lowerFilename.endsWith(".doc") ||
    lowerFilename.endsWith(".docx")
  ) {
    return "DOC";
  }

  if (
    lowerMime.includes("image") ||
    lowerFilename.endsWith(".jpg") ||
    lowerFilename.endsWith(".jpeg") ||
    lowerFilename.endsWith(".png")
  ) {
    return "IMG";
  }

  return "FILE";
}

function formatDateTime(value: string) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateOfBirth(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return "Size unavailable";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
