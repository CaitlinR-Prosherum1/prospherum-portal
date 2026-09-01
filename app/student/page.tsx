import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function StudentDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: application } = await supabase
    .from("applications")
    .select(
      "reference_number, first_name, last_name, email, programme_applied_for, status, submitted_at"
    )
    .eq("applicant_user_id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-[#07110d] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-sm text-emerald-400">Prospherum Skills Academy</p>
            <h1 className="mt-1 text-2xl font-semibold">
              Student Portal
            </h1>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="mt-10">
          <p className="text-sm text-white/50">Welcome back</p>

          <h2 className="mt-1 text-3xl font-semibold">
            {application
              ? `${application.first_name} ${application.last_name}`
              : user.email}
          </h2>

          <p className="mt-2 text-white/60">
            Manage your Prospherum application from your student portal.
          </p>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="text-lg font-semibold">Application Status</h3>

            {application ? (
              <>
                <div className="mt-5">
                  <p className="text-sm text-white/50">
                    Current status
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-emerald-400">
                    {application.status}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-sm text-white/50">
                    Reference number
                  </p>

                  <p className="mt-1 font-mono text-sm">
                    {application.reference_number}
                  </p>
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-white/70">
                  No application is currently linked to this account.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="text-lg font-semibold">Your Information</h3>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-white/50">Email</p>
                <p className="mt-1">{user.email}</p>
              </div>

              {application?.programme_applied_for && (
                <div>
                  <p className="text-sm text-white/50">
                    Programme
                  </p>
                  <p className="mt-1">
                    {application.programme_applied_for}
                  </p>
                </div>
              )}

              {application?.submitted_at && (
                <div>
                  <p className="text-sm text-white/50">
                    Application submitted
                  </p>
                  <p className="mt-1">
                    {new Date(
                      application.submitted_at
                    ).toLocaleDateString("en-ZA")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
