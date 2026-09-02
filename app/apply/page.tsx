"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

type DocumentField = {
  name: string;
  label: string;
  description: string;
  documentType: string;
  required?: boolean;
};

const DOCUMENT_FIELDS: DocumentField[] = [
  {
    name: "cv",
    label: "CV / Resume",
    description: "Upload your most recent CV or resume.",
    documentType: "CV",
    required: true,
  },
  {
    name: "id_document",
    label: "South African ID",
    description: "Upload a clear copy of your South African ID.",
    documentType: "ID",
    required: true,
  },
  {
    name: "qualification",
    label: "Highest Qualification",
    description: "Upload your highest qualification certificate.",
    documentType: "QUALIFICATION",
    required: true,
  },
  {
    name: "proof_of_address",
    label: "Proof of Address",
    description: "Optional supporting document.",
    documentType: "PROOF_OF_ADDRESS",
  },
  {
    name: "other_document",
    label: "Other Supporting Document",
    description: "Optional additional supporting document.",
    documentType: "OTHER",
  },
];

function validateFiles(form: HTMLFormElement) {
  for (const field of DOCUMENT_FIELDS) {
    const input = form.elements.namedItem(field.name) as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (field.required && !file) {
      throw new Error(`${field.label} is required.`);
    }

    if (!file) continue;

    if (file.size === 0) {
      throw new Error(`${field.label} is empty.`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`${field.label} must not exceed 10 MB.`);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(
        `${field.label} must be a PDF, JPG, PNG, DOC or DOCX file.`,
      );
    }
  }
}

async function uploadDocument(
  applicationId: string,
  file: File,
  documentType: string,
) {
  const formData = new FormData();

  formData.append("document_type", documentType);
  formData.append("file", file);

  const response = await fetch(
    `/api/applications/${applicationId}/documents`,
    {
      method: "POST",
      body: formData,
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error || `Unable to upload ${documentType} document.`,
    );
  }
}

export default function ApplyPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    const form = event.currentTarget;

    setErrorMessage("");

    try {
      validateFiles(form);

      setSubmitting(true);

      const formData = new FormData(form);

      const payload = {
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        id_number: formData.get("id_number"),
        date_of_birth: formData.get("date_of_birth"),
        address: formData.get("address"),
        city: formData.get("city"),
        province: formData.get("province"),
        highest_qualification: formData.get("highest_qualification"),
        field_of_study: formData.get("field_of_study"),
        institution: formData.get("institution"),
        programme_applied_for: formData.get("programme_applied_for"),
        skills_computer_literacy: formData.get("skills_computer_literacy"),
      };

      const applicationResponse = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const applicationResult = await applicationResponse.json();

      if (!applicationResponse.ok) {
        throw new Error(
          applicationResult?.error ||
            "Unable to create your application.",
        );
      }

      const applicationId = applicationResult.application_id;

      if (!applicationId) {
        throw new Error(
          "Application was created but no application ID was returned.",
        );
      }

      /*
       * Upload all selected supporting documents.
       */
      for (const field of DOCUMENT_FIELDS) {
        const input = form.elements.namedItem(
          field.name,
        ) as HTMLInputElement | null;

        const file = input?.files?.[0];

        if (!file) continue;

        await uploadDocument(
          applicationId,
          file,
          field.documentType,
        );
      }

      setSuccess(applicationResult.reference_number);

      /*
       * Scroll to the success message after React renders it.
       */
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 50);
    } catch (error) {
      console.error("Application submission failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit your application. Please try again.",
      );

      /*
       * Scroll to the error message only after it has rendered.
       */
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 50);
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * SUCCESS SCREEN
   */
  if (success) {
    return (
      <main className="min-h-screen bg-[var(--prospherum-grey)] text-[var(--prospherum-text)]">
        <header className="border-b border-black/10 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-12 w-48">
                <img
                  src="/branding/prospherum-logo.png"
                  alt="Prospherum Skills Academy"
                  className="h-full w-full object-contain object-left"
                />
              </div>

              <div className="hidden sm:block">
                <div className="text-lg font-bold tracking-tight">
                  Prospherum
                </div>

                <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--prospherum-muted)]">
                  Skills Academy
                </div>
              </div>
            </Link>
          </div>
        </header>

        <section className="px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <div className="bg-white p-8 text-center shadow-sm ring-1 ring-black/5 sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--prospherum-green)] text-3xl font-bold text-white">
                ✓
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-[var(--prospherum-green)]">
                Application Submitted
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight">
                Thank you for applying.
              </h1>

              <p className="mt-4 leading-7 text-[var(--prospherum-muted)]">
                Your application and supporting documents have been
                successfully received by Prospherum Skills Academy.
              </p>

              <div className="mt-8 rounded-xl bg-[var(--prospherum-grey)] p-6">
                <p className="text-sm font-semibold text-[var(--prospherum-muted)]">
                  Your application reference number
                </p>

                <p className="mt-2 text-2xl font-bold tracking-wider">
                  {success}
                </p>

                <p className="mt-3 text-xs text-[var(--prospherum-muted)]">
                  Please keep this reference number for future enquiries.
                </p>
              </div>

              <Link
                href="/"
                className="mt-8 inline-flex items-center justify-center rounded-lg bg-[var(--prospherum-green)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-black/10 bg-white px-5 py-8 text-center text-xs text-[var(--prospherum-muted)]">
          © 2026 Prospherum. All rights reserved.
        </footer>
      </main>
    );
  }

  /*
   * APPLICATION FORM
   */
  return (
    <main className="min-h-screen bg-[var(--prospherum-grey)] text-[var(--prospherum-text)]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-48">
              <img
                src="/branding/prospherum-logo.png"
                alt="Prospherum Skills Academy"
                className="h-full w-full object-contain object-left"
              />
            </div>

            <div className="hidden sm:block">
              <div className="text-lg font-bold tracking-tight">
                Prospherum
              </div>

              <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--prospherum-muted)]">
                Skills Academy
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-[var(--prospherum-muted)] transition-colors hover:text-[var(--prospherum-green)]"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <section className="bg-[var(--prospherum-black)] text-white">
        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--prospherum-green-light)]">
            Prospherum Skills Academy
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Start Your Application
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
            Complete the application form and provide the supporting
            documents required for consideration.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-4xl">
          {errorMessage && (
            <div
              id="application-error"
              role="alert"
              className="mb-8 border border-red-200 bg-red-50 p-5 text-sm text-red-800"
            >
              <p className="font-bold">
                We could not submit your application.
              </p>

              <p className="mt-1">{errorMessage}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* SECTION 1 */}
            <div className="bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
              <div className="border-b border-black/10 pb-5">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--prospherum-green)]">
                  Section 1
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Applicant Information
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--prospherum-muted)]">
                  Enter your personal information exactly as it appears on
                  your official documents.
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="first_name"
                    className="mb-2 block text-sm font-semibold"
                  >
                    First name <span className="text-red-600">*</span>
                  </label>

                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    autoComplete="given-name"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="last_name"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Last name <span className="text-red-600">*</span>
                  </label>

                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    autoComplete="family-name"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Email address <span className="text-red-600">*</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Phone number <span className="text-red-600">*</span>
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="e.g. 082 123 4567"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="id_number"
                    className="mb-2 block text-sm font-semibold"
                  >
                    South African ID number
                  </label>

                  <input
                    id="id_number"
                    name="id_number"
                    type="text"
                    inputMode="numeric"
                    maxLength={13}
                    autoComplete="off"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />

                  <p className="mt-2 text-xs text-[var(--prospherum-muted)]">
                    If required for the opportunity, this will be verified
                    against your supporting documentation.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="date_of_birth"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Date of birth
                  </label>

                  <input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2 */}
            <div className="bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
              <div className="border-b border-black/10 pb-5">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--prospherum-green)]">
                  Section 2
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Address Information
                </h2>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-semibold"
                  >
                    City / Town
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="province"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Province
                  </label>

                  <select
                    id="province"
                    name="province"
                    defaultValue=""
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  >
                    <option value="">Select province</option>
                    <option>Eastern Cape</option>
                    <option>Free State</option>
                    <option>Gauteng</option>
                    <option>KwaZulu-Natal</option>
                    <option>Limpopo</option>
                    <option>Mpumalanga</option>
                    <option>Northern Cape</option>
                    <option>North West</option>
                    <option>Western Cape</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3 */}
            <div className="bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
              <div className="border-b border-black/10 pb-5">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--prospherum-green)]">
                  Section 3
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Education and Programme
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--prospherum-muted)]">
                  Provide information about your educational background and
                  the opportunity you are applying for.
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="highest_qualification"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Highest qualification
                  </label>

                  <input
                    id="highest_qualification"
                    name="highest_qualification"
                    type="text"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field_of_study"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Field of study
                  </label>

                  <input
                    id="field_of_study"
                    name="field_of_study"
                    type="text"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="institution"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Institution
                  </label>

                  <input
                    id="institution"
                    name="institution"
                    type="text"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="programme_applied_for"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Programme applied for
                  </label>

                  <input
                    id="programme_applied_for"
                    name="programme_applied_for"
                    type="text"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="skills_computer_literacy"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Skills and computer literacy
                  </label>

                  <textarea
                    id="skills_computer_literacy"
                    name="skills_computer_literacy"
                    rows={4}
                    placeholder="List relevant computer skills, software, systems or other abilities."
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4 */}
            <div className="bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
              <div className="border-b border-black/10 pb-5">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--prospherum-green)]">
                  Section 4
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Supporting Documents
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--prospherum-muted)]">
                  Upload the documents required to support your application.
                  Each file must be no larger than 10 MB.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                {DOCUMENT_FIELDS.map((field) => (
                  <div
                    key={field.name}
                    className="rounded-xl border border-black/10 bg-[var(--prospherum-grey)] p-5"
                  >
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-bold"
                    >
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-600">*</span>
                      )}
                    </label>

                    <p className="mt-1 text-xs leading-5 text-[var(--prospherum-muted)]">
                      {field.description}
                    </p>

                    <input
                      id={field.name}
                      name={field.name}
                      type="file"
                      required={field.required}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="mt-4 block w-full cursor-pointer rounded-lg border border-black/15 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[var(--prospherum-green)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-black/10 bg-white p-4">
                <p className="text-xs leading-5 text-[var(--prospherum-muted)]">
                  <strong>Accepted formats:</strong> PDF, JPG, PNG, DOC and
                  DOCX. Maximum file size is 10 MB per document.
                </p>
              </div>
            </div>

            {/* FORM ACTIONS */}
            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/"
                className="text-center text-sm font-medium text-[var(--prospherum-muted)] transition-colors hover:text-[var(--prospherum-green)]"
              >
                Cancel and return home
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[var(--prospherum-green)] px-7 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting Application..."
                  : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-white px-5 py-8 text-center text-xs text-[var(--prospherum-muted)]">
        © 2026 Prospherum. All rights reserved.
      </footer>
    </main>
  );
}
