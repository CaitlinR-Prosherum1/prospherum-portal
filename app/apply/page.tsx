"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ApplyPage() {
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    // Submission logic will be added after the form structure
    // has been tested.
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-[var(--prospherum-grey)] text-[var(--prospherum-text)]">
      {/* Header */}
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

      {/* Page heading */}
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

      {/* Application form */}
      <section className="px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* Applicant information */}
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
                {/* First name */}
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

                {/* Last name */}
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

                {/* Email */}
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

                {/* Phone */}
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

                {/* ID number */}
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
                    placeholder="13-digit ID number"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />

                  <p className="mt-2 text-xs text-[var(--prospherum-muted)]">
                    If required for the opportunity, this will be verified
                    against your supporting documentation.
                  </p>
                </div>

                {/* Date of birth */}
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

            {/* Address */}
            <div className="bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
              <div className="border-b border-black/10 pb-5">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--prospherum-green)]">
                  Section 2
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Address Information
                </h2>
              </div>

              <div className="mt-6 space-y-5">
                <div>
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
                    autoComplete="street-address"
                    placeholder="Street address"
                    className="w-full resize-none rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
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
                      autoComplete="address-level2"
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
                      <option value="" disabled>
                        Select province
                      </option>
                      <option value="Eastern Cape">Eastern Cape</option>
                      <option value="Free State">Free State</option>
                      <option value="Gauteng">Gauteng</option>
                      <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                      <option value="Limpopo">Limpopo</option>
                      <option value="Mpumalanga">Mpumalanga</option>
                      <option value="Northern Cape">Northern Cape</option>
                      <option value="North West">North West</option>
                      <option value="Western Cape">Western Cape</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>


                        {/* Education and programme */}
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
                {/* Highest qualification */}
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
                    placeholder="e.g. Grade 12, Diploma, Degree"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                {/* Field of study */}
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
                    placeholder="e.g. Information Technology"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                {/* Institution */}
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
                    placeholder="Name of school, college or institution"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                {/* Programme */}
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
                    placeholder="Enter the programme or opportunity"
                    className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>

                {/* Skills and computer literacy */}
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
                    placeholder="Describe your relevant skills, computer knowledge, software experience or other abilities."
                    className="w-full resize-none rounded-lg border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[var(--prospherum-green)] focus:ring-2 focus:ring-[var(--prospherum-green)]/10"
                  />
                </div>
              </div>
            </div>

            {/* Form actions */}
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
                className="bg-[var(--prospherum-green)] px-8 py-4 font-bold text-white transition-colors hover:bg-[var(--prospherum-green-dark)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Continue Application"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--prospherum-black)] px-5 py-8 text-center text-sm text-white/60 sm:px-8">
        © {new Date().getFullYear()} Prospherum. All rights reserved.
      </footer>
    </main>
  );
}
