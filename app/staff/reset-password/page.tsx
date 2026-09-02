"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkRecoverySession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          "This password reset link is invalid or has expired. Please request a new password reset link.",
        );
        return;
      }

      setReady(true);
    };

    checkRecoverySession();
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Your new password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      console.error("Password update error:", updateError);
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setMessage("Your password has been updated successfully.");

    await supabase.auth.signOut();

    setTimeout(() => {
      router.push("/staff/login?reset=success");
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/branding/prospherum-logo.png"
            alt="Prospherum Skills Academy"
            className="mx-auto mb-5 h-20 w-auto object-contain"
          />

          <h1 className="text-3xl font-bold">
            Set New Password
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Create a new password for your Prospherum staff account.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
          {!ready && !error && (
            <div className="py-6 text-center text-sm text-gray-400">
              Verifying your password reset link...
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {message}
            </div>
          )}

          {ready && !message && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  New password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-green-500"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  Confirm new password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Enter the password again"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-green-500"
                />
              </div>

              <p className="text-xs text-gray-500">
                Password must contain at least 8 characters.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Updating password..." : "Update Password"}
              </button>
            </form>
          )}

          {error && (
            <button
              type="button"
              onClick={() => router.push("/staff/login")}
              className="mt-4 w-full rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5"
            >
              Return to Staff Login
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Authorised Prospherum staff only.
        </p>
      </div>
    </main>
  );
}
