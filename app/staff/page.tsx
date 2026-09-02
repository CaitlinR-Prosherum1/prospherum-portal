"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type StaffProfile = {
  id: string;
  first_name: string;
  last_name: string;
  role: "ADMIN" | "MANAGER" | "REVIEWER";
  active: boolean;
};

type StaffUser = {
  id: string;
  email?: string;
};

type StaffResponse = {
  authenticated: boolean;
  user: StaffUser;
  profile: StaffProfile;
};

type Application = {
  id: string;
  reference_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  programme_applied_for: string | null;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = [
  "ALL",
  "NEW",
  "UNDER_REVIEW",
  "REQUIRES_INFORMATION",
  "SHORTLISTED",
  "SELECTED",
  "NOT_SELECTED",
  "ARCHIVED",
];

export default function StaffDashboardPage() {
  const supabase = createClient();

  const [staff, setStaff] = useState<StaffResponse | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setErrorMessage("");

        const staffResponse = await fetch("/api/staff/me", {
          method: "GET",
          credentials: "include",
        });

        const staffResult = await staffResponse.json().catch(() => null);

        if (!staffResponse.ok) {
          routerRedirectToLogin();
          return;
        }

        setStaff(staffResult);

        const {
          data: applicationData,
          error: applicationError,
        } = await supabase
          .from("applications")
          .select(
            "id, reference_number, first_name, last_name, email, phone, programme_applied_for, status, created_at",
          )
          .order("created_at", { ascending: false });

        if (applicationError) {
          console.error("Application lookup error:", applicationError);
          setErrorMessage(
            "Staff access is working, but applications could not be loaded.",
          );
          return;
        }

        setApplications(applicationData || []);
      } catch (error) {
        console.error("Dashboard loading error:", error);
        setErrorMessage("Unable to load the staff dashboard.");
      } finally {
        setLoading(false);
        setApplicationsLoading(false);
      }
    }

    loadDashboard();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/staff/login";
  }

const statistics = useMemo(() => {
  const total = applications.length;

  const count = (status: string) =>
    applications.filter(
      (application) => application.status?.toUpperCase() === status,
    ).length;

  return {
    total,
    newApplications: count("NEW"),
    underReview: count("UNDER_REVIEW"),
    requiresInformation: count("REQUIRES_INFORMATION"),
    shortlisted: count("SHORTLISTED"),
    selected: count("SELECTED"),
    notSelected: count("NOT_SELECTED"),
    archived: count("ARCHIVED"),
  };
}, [applications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        application.status?.toUpperCase() === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        application.reference_number?.toLowerCase().includes(query) ||
        application.first_name?.toLowerCase().includes(query) ||
        application.last_name?.toLowerCase().includes(query) ||
        application.email?.toLowerCase().includes(query) ||
        application.phone?.toLowerCase().includes(query) ||
        application.programme_applied_for
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [applications, search, statusFilter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-green-500" />
            <p className="text-sm text-gray-400">
              Loading staff dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!staff) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/95 backdrop-blur">
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

              <p className="text-sm font-medium text-white">
                Application Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">
                {staff.profile.first_name} {staff.profile.last_name}
              </p>

              <p className="text-xs text-green-400">
                {staff.profile.role}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-green-400">
            Prospherum Skills Academy
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Staff Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage learner applications and monitor the application pipeline.
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Statistics */}
<section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <StatCard
    label="Total"
    value={statistics.total}
    description="All applications"
  />

  <StatCard
    label="New"
    value={statistics.newApplications}
    description="Awaiting review"
  />

  <StatCard
    label="Under Review"
    value={statistics.underReview}
    description="Currently being reviewed"
  />

  <StatCard
    label="Requires Information"
    value={statistics.requiresInformation}
    description="Applicant follow-up needed"
  />

  <StatCard
    label="Shortlisted"
    value={statistics.shortlisted}
    description="Selected for consideration"
  />

  <StatCard
    label="Selected"
    value={statistics.selected}
    description="Selected learners"
  />

  <StatCard
    label="Not Selected"
    value={statistics.notSelected}
    description="Unsuccessful applications"
  />

  <StatCard
    label="Archived"
    value={statistics.archived}
    description="Archived records"
  />
</section>

{/* Dashboard Intelligence */}
<section className="mb-8 grid gap-6 lg:grid-cols-2">
  {/* Application Pipeline */}
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white">
        Application Pipeline
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Current distribution of learner applications.
      </p>
    </div>

    <div className="space-y-5">
      <PipelineRow
        label="New"
        value={statistics.newApplications}
        total={statistics.total}
        color="bg-blue-500"
      />

      <PipelineRow
        label="Under Review"
        value={statistics.underReview}
        total={statistics.total}
        color="bg-purple-500"
      />

      <PipelineRow
        label="Requires Information"
        value={statistics.requiresInformation}
        total={statistics.total}
        color="bg-yellow-500"
      />

      <PipelineRow
        label="Shortlisted"
        value={statistics.shortlisted}
        total={statistics.total}
        color="bg-cyan-500"
      />

      <PipelineRow
        label="Selected"
        value={statistics.selected}
        total={statistics.total}
        color="bg-green-500"
      />
    </div>
  </div>


  {/* Action Required */}
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white">
        Action Required
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Applications that may require staff attention.
      </p>
    </div>

    <div className="space-y-3">
      <ActionItem
        label="New applications awaiting review"
        value={statistics.newApplications}
        color="blue"
      />

      <ActionItem
        label="Applications requiring information"
        value={statistics.requiresInformation}
        color="yellow"
      />

      <ActionItem
        label="Applications currently under review"
        value={statistics.underReview}
        color="purple"
      />

      <ActionItem
        label="Shortlisted applications"
        value={statistics.shortlisted}
        color="cyan"
      />
    </div>

    <div className="mt-6 border-t border-white/10 pt-5">
      <p className="text-xs text-gray-500">
        Use the application list below to review and manage these records.
      </p>
    </div>
  </div>
</section>

        {/* Applications */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl">
          <div className="border-b border-white/10 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Learner Applications
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {filteredApplications.length} application
                  {filteredApplications.length === 1 ? "" : "s"} shown
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search applications..."
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-green-500 sm:w-72"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white outline-none focus:border-green-500"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status === "ALL"
                        ? "All statuses"
                        : formatStatus(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {applicationsLoading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading applications...
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <span className="text-xl text-gray-500">+</span>
              </div>

              <h3 className="text-sm font-semibold text-white">
                No applications found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-4 font-medium">Reference</th>
                    <th className="px-5 py-4 font-medium">Applicant</th>
                    <th className="px-5 py-4 font-medium">Contact</th>
                    <th className="px-5 py-4 font-medium">Programme</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Submitted</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-b border-white/5 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-medium text-green-400">
                          {application.reference_number}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {application.first_name}{" "}
                            {application.last_name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {application.email}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-400">
                        {application.phone || "—"}
                      </td>

                      <td className="max-w-[220px] px-5 py-4 text-sm text-gray-400">
                        <span className="line-clamp-2">
                          {application.programme_applied_for || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={application.status} />
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(application.created_at)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/staff/applications/${application.id}`}
                          className="inline-flex items-center rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-green-500/40 hover:bg-green-500/10 hover:text-green-300"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function routerRedirectToLogin() {
  window.location.href = "/staff/login";
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-white">{value}</p>

      <p className="mt-1 text-xs text-gray-600">{description}</p>
    </div>
  );
}

function PipelineRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm text-gray-300">{label}</span>

        <span className="text-sm font-medium text-white">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-1 text-right text-xs text-gray-600">
        {percentage}%
      </p>
    </div>
  );
}

function ActionItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "yellow" | "purple" | "cyan";
}) {
  const colorClasses = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-300",
    yellow: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-300",
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-xs font-semibold ${colorClasses[color]}`}
        >
          {value}
        </span>

        <span className="text-sm text-gray-300">
          {label}
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase() || "UNKNOWN";

  let classes =
    "border-white/10 bg-white/5 text-gray-300";

  if (normalized === "NEW") {
    classes = "border-blue-500/20 bg-blue-500/10 text-blue-300";
  } else if (normalized === "UNDER_REVIEW") {
    classes = "border-purple-500/20 bg-purple-500/10 text-purple-300";
  } else if (normalized === "REQUIRES_INFORMATION") {
    classes = "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
  } else if (normalized === "SHORTLISTED") {
    classes = "border-cyan-500/20 bg-cyan-500/10 text-cyan-300";
  } else if (normalized === "SELECTED") {
    classes = "border-green-500/20 bg-green-500/10 text-green-300";
  } else if (normalized === "NOT_SELECTED") {
    classes = "border-red-500/20 bg-red-500/10 text-red-300";
  } else if (normalized === "ARCHIVED") {
    classes = "border-gray-500/20 bg-gray-500/10 text-gray-400";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}
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

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
