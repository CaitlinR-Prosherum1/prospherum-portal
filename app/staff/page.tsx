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
      <main className="relative min-h-screen overflow-hidden bg-[#050806] text-white">
        <DashboardAtmosphere />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-5">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/5">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
            </div>

            <p className="text-sm text-white/50">
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
    <main className="relative min-h-screen overflow-x-hidden bg-[#050806] text-white">
      <DashboardAtmosphere />

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050806]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link
              href="/staff"
              aria-label="Prospherum staff dashboard"
              className="relative flex h-9 w-36 shrink-0 items-center sm:h-11 sm:w-48"
            >
              <img
                src="/branding/prospherum_logo_trans3.png"
                alt="Prospherum Skills Academy"
                className="h-full w-full object-contain object-left"
              />
            </Link>

            <div className="hidden min-w-0 border-l border-white/10 pl-4 sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-400">
                Staff Portal
              </p>

              <p className="truncate text-sm font-medium text-white/80">
                Application Management
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">
                {staff.profile.first_name}{" "}
                {staff.profile.last_name}
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                {staff.profile.role}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="min-h-10 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-medium text-white/65 transition-all hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 sm:px-4 sm:text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Page heading */}

        <div className="mb-6 sm:mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-7 bg-emerald-400" />

            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-400 sm:text-[11px]">
              Prospherum Skills Academy
            </p>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Staff Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
            Manage learner applications and monitor the application
            pipeline.
          </p>
        </div>

        {/* Error */}

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/[0.08] px-4 py-4 text-sm leading-6 text-red-300 sm:px-5">
            {errorMessage}
          </div>
        )}

        {/* =====================================================
            KPI CARDS
            ===================================================== */}

        <section className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Total"
            value={statistics.total}
            description="All applications"
            accent="emerald"
            delay={0}
          />

          <StatCard
            label="New"
            value={statistics.newApplications}
            description="Awaiting review"
            accent="blue"
            delay={80}
          />

          <StatCard
            label="Under Review"
            value={statistics.underReview}
            description="Currently being reviewed"
            accent="purple"
            delay={160}
          />

          <StatCard
            label="Requires Information"
            value={statistics.requiresInformation}
            description="Applicant follow-up needed"
            accent="amber"
            delay={240}
          />

          <StatCard
            label="Shortlisted"
            value={statistics.shortlisted}
            description="Selected for consideration"
            accent="cyan"
            delay={320}
          />

          <StatCard
            label="Selected"
            value={statistics.selected}
            description="Selected learners"
            accent="green"
            delay={400}
          />

          <StatCard
            label="Not Selected"
            value={statistics.notSelected}
            description="Unsuccessful applications"
            accent="red"
            delay={480}
          />

          <StatCard
            label="Archived"
            value={statistics.archived}
            description="Archived records"
            accent="slate"
            delay={560}
          />
        </section>

        {/* =====================================================
            DASHBOARD INTELLIGENCE
            ===================================================== */}

        <section className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-2">
          {/* Application Pipeline */}

          <div className="dashboard-panel dashboard-panel-delay-1 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.18)] sm:p-6">
            <div className="mb-5 sm:mb-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />

                <h2 className="text-lg font-semibold text-white">
                  Application Pipeline
                </h2>
              </div>

              <p className="mt-2 text-sm leading-6 text-white/35">
                Current distribution of learner applications.
              </p>
            </div>

            <div className="space-y-5">
              <PipelineRow
                label="New"
                value={statistics.newApplications}
                total={statistics.total}
                color="bg-blue-400"
              />

              <PipelineRow
                label="Under Review"
                value={statistics.underReview}
                total={statistics.total}
                color="bg-purple-400"
              />

              <PipelineRow
                label="Requires Information"
                value={statistics.requiresInformation}
                total={statistics.total}
                color="bg-amber-400"
              />

              <PipelineRow
                label="Shortlisted"
                value={statistics.shortlisted}
                total={statistics.total}
                color="bg-cyan-400"
              />

              <PipelineRow
                label="Selected"
                value={statistics.selected}
                total={statistics.total}
                color="bg-emerald-400"
              />
            </div>
          </div>

          {/* Action Required */}

          <div className="dashboard-panel dashboard-panel-delay-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.18)] sm:p-6">
            <div className="mb-5 sm:mb-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]" />

                <h2 className="text-lg font-semibold text-white">
                  Action Required
                </h2>
              </div>

              <p className="mt-2 text-sm leading-6 text-white/35">
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

            <div className="mt-6 border-t border-white/[0.08] pt-5">
              <p className="text-xs leading-5 text-white/30">
                Use the application list below to review and manage
                these records.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            APPLICATIONS
            ===================================================== */}

        <section className="dashboard-panel dashboard-panel-delay-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
          <div className="border-b border-white/[0.08] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <h2 className="text-lg font-semibold text-white">
                    Learner Applications
                  </h2>
                </div>

                <p className="mt-1.5 text-sm text-white/35">
                  {filteredApplications.length} application
                  {filteredApplications.length === 1
                    ? ""
                    : "s"}{" "}
                  shown
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search applications..."
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/50 focus:bg-black/45 focus:ring-2 focus:ring-emerald-400/10 sm:w-72"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400/50 sm:w-auto"
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
            <div className="p-8 text-center text-sm text-white/35 sm:p-10">
              Loading applications...
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center sm:p-12">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <span className="text-xl text-white/30">+</span>
              </div>

              <h3 className="text-sm font-semibold text-white">
                No applications found
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/35">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/[0.08] text-left text-xs uppercase tracking-wider text-white/30">
                    <th className="px-5 py-4 font-medium">
                      Reference
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Applicant
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Contact
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Programme
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Submitted
                    </th>

                    <th className="px-5 py-4 text-right font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-b border-white/[0.05] transition-colors hover:bg-emerald-400/[0.025]"
                    >
                      <td className="px-5 py-4">
                        <span className="whitespace-nowrap font-mono text-sm font-medium text-emerald-400">
                          {application.reference_number}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-[220px]">
                          <p className="truncate text-sm font-medium text-white">
                            {application.first_name}{" "}
                            {application.last_name}
                          </p>

                          <p className="mt-1 truncate text-xs text-white/30">
                            {application.email}
                          </p>
                        </div>
                      </td>

                      <td className="max-w-[180px] px-5 py-4 text-sm text-white/45">
                        <span className="block truncate">
                          {application.phone || "—"}
                        </span>
                      </td>

                      <td className="max-w-[220px] px-5 py-4 text-sm text-white/45">
                        <span className="line-clamp-2">
                          {application.programme_applied_for ||
                            "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={application.status}
                        />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-white/30">
                        {formatDate(application.created_at)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/staff/applications/${application.id}`}
                          className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-medium text-white/60 transition-all hover:border-emerald-400/30 hover:bg-emerald-500/10 hover:text-emerald-300"
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

/* ============================================================
   BACKGROUND ATMOSPHERE
   ============================================================ */

function DashboardAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -right-48 top-[-160px] h-[520px] w-[520px] rounded-full bg-emerald-500/[0.055] blur-[140px]" />

      <div className="absolute -left-48 top-[38%] h-[450px] w-[450px] rounded-full bg-emerald-400/[0.035] blur-[150px]" />

      <div className="absolute right-[15%] top-[48%] h-[280px] w-[280px] rounded-full bg-cyan-400/[0.02] blur-[120px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.025),transparent_40%)]" />
    </div>
  );
}

/* ============================================================
   KPI CARD
   ============================================================ */

function StatCard({
  label,
  value,
  description,
  accent,
  delay,
}: {
  label: string;
  value: number;
  description: string;
  accent:
    | "emerald"
    | "blue"
    | "purple"
    | "amber"
    | "cyan"
    | "green"
    | "red"
    | "slate";
  delay: number;
}) {
  const accentStyles = {
    emerald: {
      dot: "bg-emerald-400",
      glow: "group-hover:shadow-emerald-500/10",
      number: "text-white",
      line: "bg-emerald-400",
    },

    blue: {
      dot: "bg-blue-400",
      glow: "group-hover:shadow-blue-500/10",
      number: "text-white",
      line: "bg-blue-400",
    },

    purple: {
      dot: "bg-purple-400",
      glow: "group-hover:shadow-purple-500/10",
      number: "text-white",
      line: "bg-purple-400",
    },

    amber: {
      dot: "bg-amber-400",
      glow: "group-hover:shadow-amber-500/10",
      number: "text-white",
      line: "bg-amber-400",
    },

    cyan: {
      dot: "bg-cyan-400",
      glow: "group-hover:shadow-cyan-500/10",
      number: "text-white",
      line: "bg-cyan-400",
    },

    green: {
      dot: "bg-green-400",
      glow: "group-hover:shadow-green-500/10",
      number: "text-white",
      line: "bg-green-400",
    },

    red: {
      dot: "bg-red-400",
      glow: "group-hover:shadow-red-500/10",
      number: "text-white",
      line: "bg-red-400",
    },

    slate: {
      dot: "bg-slate-400",
      glow: "group-hover:shadow-slate-500/10",
      number: "text-white",
      line: "bg-slate-400",
    },
  };

  const style = accentStyles[accent];

  return (
    <div
      className={`dashboard-kpi group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 shadow-[0_15px_50px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.055] hover:shadow-xl ${style.glow}`}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Accent line */}

      <div
        className={`absolute left-0 top-0 h-px w-full opacity-50 ${style.line}`}
      />

      {/* Glow */}

      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30 ${style.dot}`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            {label}
          </p>

          <span
            className={`h-1.5 w-1.5 rounded-full shadow-[0_0_10px_currentColor] ${style.dot}`}
          />
        </div>

        <div className="mt-3">
          <AnimatedNumber
            value={value}
            className={`text-2xl font-semibold tracking-tight sm:text-3xl ${style.number}`}
          />
        </div>

        <p className="mt-1 text-xs leading-5 text-white/30">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   ANIMATED KPI NUMBER
   ============================================================ */

function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrame = 0;
    const startTime = performance.now();
    const duration = 800;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased =
        1 - Math.pow(1 - progress, 3);

      setDisplayValue(
        Math.round(value * eased),
      );

      if (progress < 1) {
        animationFrame =
          requestAnimationFrame(animate);
      }
    }

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [value]);

  return (
    <span className={className}>
      {displayValue}
    </span>
  );
}

/* ============================================================
   PIPELINE
   ============================================================ */

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
        <span className="min-w-0 text-sm text-white/60">
          {label}
        </span>

        <span className="shrink-0 text-sm font-medium text-white">
          {value}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`pipeline-bar h-full rounded-full ${color}`}
          style={
            {
              "--pipeline-width": `${percentage}%`,
            } as React.CSSProperties
          }
        />
      </div>

      <p className="mt-1 text-right text-[10px] text-white/25">
        {percentage}%
      </p>
    </div>
  );
}

/* ============================================================
   ACTION ITEM
   ============================================================ */

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
    blue: "border-blue-400/15 bg-blue-400/[0.06] text-blue-300",
    yellow:
      "border-yellow-400/15 bg-yellow-400/[0.06] text-yellow-300",
    purple:
      "border-purple-400/15 bg-purple-400/[0.06] text-purple-300",
    cyan: "border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-300",
  };

  return (
    <div className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-3 transition-all hover:border-white/[0.10] hover:bg-white/[0.04] sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border px-2 text-xs font-semibold transition-transform duration-300 group-hover:scale-105 ${colorClasses[color]}`}
        >
          {value}
        </span>

        <span className="text-sm leading-5 text-white/55">
          {label}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
   ============================================================ */

function StatusBadge({ status }: { status: string }) {
  const normalized =
    status?.toUpperCase() || "UNKNOWN";

  let classes =
    "border-white/10 bg-white/5 text-white/45";

  if (normalized === "NEW") {
    classes =
      "border-blue-400/20 bg-blue-400/10 text-blue-300";
  } else if (normalized === "UNDER_REVIEW") {
    classes =
      "border-purple-400/20 bg-purple-400/10 text-purple-300";
  } else if (normalized === "REQUIRES_INFORMATION") {
    classes =
      "border-amber-400/20 bg-amber-400/10 text-amber-300";
  } else if (normalized === "SHORTLISTED") {
    classes =
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
  } else if (normalized === "SELECTED") {
    classes =
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  } else if (normalized === "NOT_SELECTED") {
    classes =
      "border-red-400/20 bg-red-400/10 text-red-300";
  } else if (normalized === "ARCHIVED") {
    classes =
      "border-slate-400/20 bg-slate-400/10 text-slate-400";
  }

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      {formatStatus(normalized)}
    </span>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
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

function routerRedirectToLogin() {
  window.location.href = "/staff/login";
}