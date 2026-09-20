"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const HERO_IMAGES = [
  "/branding/pic1.jpg",
  "/branding/pic2.png",
  "/branding/pic3.jpg",
  "/branding/pic4.jpg",
  "/branding/pic5.jpg",
  "/branding/pic6.png",
  "/branding/pic7.jpg",
  "/branding/pic8.jpg",
  "/branding/pic9.png",
  "/branding/pic10.png",
  "/branding/pic11.jpg",
  "/branding/pic12.png",
  "/branding/pic13.png",
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
    const input = form.elements.namedItem(
      field.name,
    ) as HTMLInputElement | null;

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

function PageAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -right-44 top-1/4 h-[420px] w-[420px] rounded-full bg-emerald-400/[0.045] blur-[140px]" />
      <div className="absolute -left-44 bottom-1/4 h-[360px] w-[360px] rounded-full bg-emerald-300/[0.035] blur-[130px]" />
    </div>
  );
}

const inputClass =
  "mt-2 block min-h-[50px] w-full appearance-none rounded-xl border border-[#b8c4bd] bg-[#eef2f0] px-4 py-3 text-sm text-[#17221c] shadow-sm outline-none transition-all duration-150 placeholder:text-[#7a8780] hover:border-[#9eaba3] hover:bg-[#f3f6f4] focus:border-[#18a85b] focus:bg-white focus:ring-4 focus:ring-[#18a85b]/10";

const textareaClass =
  "mt-2 block w-full rounded-xl border border-[#b8c4bd] bg-[#eef2f0] px-4 py-3 text-sm text-[#17221c] shadow-sm outline-none transition-all duration-150 placeholder:text-[#7a8780] hover:border-[#9eaba3] hover:bg-[#f3f6f4] focus:border-[#18a85b] focus:bg-white focus:ring-4 focus:ring-[#18a85b]/10";

export default function ApplyPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % HERO_IMAGES.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, []);

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

  if (success) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#f4f7f5] text-[var(--prospherum-text)]">
        <PageAtmosphere />

        <header className="relative z-20 border-b border-black/[0.08] bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 sm:py-4">
            <Link
              href="/"
              aria-label="Prospherum home"
              className="relative flex h-9 w-36 items-center sm:h-11 sm:w-48"
            >
              <Image
                src="/branding/prospherum_logo_trans3.png"
                alt="Prospherum Skills Academy"
                fill
                priority
                className="object-contain object-left"
              />
            </Link>

            <Link
              href="/"
              className="text-xs font-semibold text-[var(--prospherum-muted)] transition hover:text-[var(--prospherum-green)] sm:text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </header>

        <section className="relative z-10 px-5 py-12 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl border border-black/[0.06] bg-white p-7 shadow-xl shadow-black/[0.06] sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl font-bold text-white">
                ✓
              </div>

              <div className="mt-6 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--prospherum-green)]">
                  Application Submitted
                </p>

                <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  Thank you for applying.
                </h1>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[var(--prospherum-muted)] sm:text-base sm:leading-7">
                  Your application and supporting documents have been
                  successfully received by Prospherum Skills Academy.
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-emerald-500/10 bg-[#eef9f2] p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--prospherum-muted)]">
                  Your application reference number
                </p>

                <p className="mt-3 text-2xl font-bold tracking-[0.14em] text-[var(--prospherum-text)]">
                  {success}
                </p>

                <p className="mt-3 text-xs leading-5 text-[var(--prospherum-muted)]">
                  Please keep this reference number for future enquiries.
                </p>
              </div>

              <div className="mt-8 flex justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--prospherum-green)] px-7 py-3 text-sm font-bold text-white transition hover:bg-[var(--prospherum-green-dark)]"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="relative z-10 border-t border-black/[0.08] bg-white px-5 py-7 text-center text-xs text-[var(--prospherum-muted)]">
          © {new Date().getFullYear()} Prospherum. All rights reserved.
        </footer>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f4f7f5] text-[var(--prospherum-text)]">
      <PageAtmosphere />

      {/* HEADER */}
      <header className="relative z-30 border-b border-white/10 bg-[#07100c]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8 sm:py-4">
          <Link
            href="/"
            aria-label="Prospherum home"
            className="relative flex h-9 w-36 shrink-0 items-center sm:h-11 sm:w-48"
          >
            <Image
              src="/branding/prospherum_logo_trans3.png"
              alt="Prospherum Skills Academy"
              fill
              priority
              className="object-contain object-left"
            />
          </Link>

          <Link
            href="/"
            className="text-xs font-medium text-white/55 transition hover:text-white sm:text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[390px] overflow-hidden bg-[#07100c] text-white sm:min-h-[430px]">
        {HERO_IMAGES.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-[1800ms] ${
              index === activeImage ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30" />

        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-emerald-400/10 blur-[120px]" />

        <div className="relative z-10 mx-auto flex min-h-[390px] max-w-7xl items-end px-5 pb-10 sm:min-h-[430px] sm:px-8 sm:pb-14">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-emerald-400" />

              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#b7e8cc] sm:text-[11px]">
                Prospherum Skills Academy
              </p>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.8rem]">
              Start Your Application
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
              Complete the application form and provide the supporting
              documents required for consideration.
            </p>

            <div className="mt-7 flex items-center gap-1.5">
              {HERO_IMAGES.map((image, index) => (
                <span
                  key={image}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    index === activeImage
                      ? "w-7 bg-emerald-400"
                      : "w-1.5 bg-white/35"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="relative z-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {errorMessage && (
            <div
              id="application-error"
              role="alert"
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-800 shadow-sm"
            >
              <p className="font-bold">
                We could not submit your application.
              </p>

              <p className="mt-1">{errorMessage}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* SECTION 1 */}
            <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm">
              <SectionHeader
                number="01"
                eyebrow="Applicant Information"
                title="Personal details"
                description="Enter your information exactly as it appears on your official documents."
              />

              <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-7 sm:py-7">
                <FormField
                  id="first_name"
                  name="first_name"
                  label="First name"
                  required
                  autoComplete="given-name"
                />

                <FormField
                  id="last_name"
                  name="last_name"
                  label="Last name"
                  required
                  autoComplete="family-name"
                />

                <FormField
                  id="email"
                  name="email"
                  label="Email address"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />

                <FormField
                  id="phone"
                  name="phone"
                  label="Phone number"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="e.g. 082 123 4567"
                />

                <FormField
                  id="id_number"
                  name="id_number"
                  label="South African ID number"
                  inputMode="numeric"
                  maxLength={13}
                  autoComplete="off"
                  helper="If required for the opportunity, this will be verified against your supporting documentation."
                />

                <FormField
                  id="date_of_birth"
                  name="date_of_birth"
                  label="Date of birth"
                  type="date"
                />
              </div>
            </section>

            {/* SECTION 2 */}
            <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm">
              <SectionHeader
                number="02"
                eyebrow="Address Information"
                title="Where you live"
              />

              <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-7 sm:py-7">
                <div className="sm:col-span-2">
                  <FormLabel htmlFor="address">
                    Address
                  </FormLabel>

                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    className={`${textareaClass}`}
                  />
                </div>

                <div>
                  <FormLabel htmlFor="city">
                    City / Town
                  </FormLabel>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    className={inputClass}
                  />
                </div>

                <div>
                  <FormLabel htmlFor="province">
                    Province
                  </FormLabel>

                  <select
                    id="province"
                    name="province"
                    defaultValue=""
                    className={inputClass}
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
            </section>

            {/* SECTION 3 */}
            <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm">
              <SectionHeader
                number="03"
                eyebrow="Education and Programme"
                title="Your education and opportunity"
                description="Provide information about your educational background and the opportunity you are applying for."
              />

              <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-7 sm:py-7">
                <FormField
                  id="highest_qualification"
                  name="highest_qualification"
                  label="Highest qualification"
                />

                <FormField
                  id="field_of_study"
                  name="field_of_study"
                  label="Field of study"
                />

                <FormField
                  id="institution"
                  name="institution"
                  label="Institution"
                />

                <FormField
                  id="programme_applied_for"
                  name="programme_applied_for"
                  label="Programme applied for"
                />

                <div className="sm:col-span-2">
                  <FormLabel htmlFor="skills_computer_literacy">
                    Skills and computer literacy
                  </FormLabel>

                  <textarea
                    id="skills_computer_literacy"
                    name="skills_computer_literacy"
                    rows={4}
                    placeholder="List relevant computer skills, software, systems or other abilities."
                    className={textareaClass}
                  />
                </div>
              </div>
            </section>

            {/* SECTION 4 */}
            <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm">
              <SectionHeader
                number="04"
                eyebrow="Supporting Documents"
                title="Upload your documents"
                description="Upload the documents required to support your application. Each file must be no larger than 10 MB."
              />

              <div className="space-y-4 px-5 py-5 sm:px-7 sm:py-7">
                {DOCUMENT_FIELDS.map((field) => (
                  <div
                    key={field.name}
                    className="rounded-2xl border border-black/[0.07] bg-[#f7f9f7] p-4 transition hover:border-emerald-400/30 hover:bg-[#f4faf6] sm:p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <label
                          htmlFor={field.name}
                          className="text-sm font-bold"
                        >
                          {field.label}{" "}
                          {field.required && (
                            <span className="text-red-600">*</span>
                          )}
                        </label>

                        <p className="mt-1 text-xs leading-5 text-[var(--prospherum-muted)]">
                          {field.description}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--prospherum-muted)] ring-1 ring-black/[0.06]">
                        {field.required ? "Required" : "Optional"}
                      </span>
                    </div>

                    <input
                      id={field.name}
                      name={field.name}
                      type="file"
                      required={field.required}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="mt-4 block min-h-[50px] w-full cursor-pointer rounded-xl border border-[#b8c4bd] bg-[#eef2f0] p-2.5 text-sm text-[#17221c] outline-none transition hover:border-[#9eaba3] hover:bg-[#f3f6f4] focus:border-[#18a85b] focus:ring-4 focus:ring-[#18a85b]/10 file:mr-3 file:rounded-lg file:border-0 file:bg-[#18a85b] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                    />
                  </div>
                ))}

                <div className="rounded-xl border border-emerald-500/10 bg-[#eef9f2] px-4 py-3">
                  <p className="text-xs leading-5 text-[var(--prospherum-muted)]">
                    <strong className="text-[var(--prospherum-text)]">
                      Accepted formats:
                    </strong>{" "}
                    PDF, JPG, PNG, DOC and DOCX. Maximum file size is 10 MB
                    per document.
                  </p>
                </div>
              </div>
            </section>

            {/* ACTIONS */}
            <div className="flex flex-col-reverse gap-3 border-t border-black/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-medium text-[var(--prospherum-muted)] transition hover:bg-white hover:text-[var(--prospherum-green)]"
              >
                Cancel and return home
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--prospherum-green)] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[var(--prospherum-green-dark)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting Application..."
                  : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <footer className="border-t border-black/[0.08] bg-white px-5 py-7 text-center text-xs text-[var(--prospherum-muted)]">
        © {new Date().getFullYear()} Prospherum. All rights reserved.
      </footer>
    </main>
  );
}

function SectionHeader({
  number,
  eyebrow,
  title,
  description,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-black/[0.07] px-5 py-5 sm:px-7">
      <div className="flex items-start gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f7ed] text-xs font-black text-[var(--prospherum-green)]">
          {number}
        </span>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--prospherum-green)]">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-lg font-bold sm:text-xl">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs leading-5 text-[var(--prospherum-muted)] sm:text-sm">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FormLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-[#17221c]"
    >
      {children}
    </label>
  );
}

function FormField({
  id,
  name,
  label,
  type = "text",
  required = false,
  autoComplete,
  placeholder,
  inputMode,
  maxLength,
  helper,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  helper?: string;
}) {
  return (
    <div className="min-w-0">
      <FormLabel htmlFor={id}>
        {label}{" "}
        {required && <span className="text-red-600">*</span>}
      </FormLabel>

      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className={inputClass}
      />

      {helper && (
        <p className="mt-2 text-[11px] leading-5 text-[#68756d]">
          {helper}
        </p>
      )}
    </div>
  );
}