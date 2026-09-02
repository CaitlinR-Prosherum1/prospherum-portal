"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StaffLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setResetMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage("Invalid email address or password.");
        return;
      }

      const response = await fetch("/api/staff/me", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        await supabase.auth.signOut();

        setErrorMessage(
          result?.error ||
            "Your account does not have active Prospherum staff access.",
        );
        return;
      }

      router.push("/staff");
      router.refresh();
    } catch (error) {
      console.error("Staff login error:", error);
      setErrorMessage("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setErrorMessage("");
    setResetMessage("");

    if (!email.trim()) {
      setErrorMessage(
        "Enter your staff email address first, then click Forgot password.",
      );
      return;
    }

    setResetLoading(true);

    try {
      const redirectTo = `${window.location.origin}/staff/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo,
        },
      );

      if (error) {
        console.error("Password reset error:", error);

        if (error.message.toLowerCase().includes("rate limit")) {
          setErrorMessage(
            "Password reset emails are temporarily rate-limited by Supabase. Please wait before requesting another email.",
          );
        } else {
          setErrorMessage(
            "Unable to send the password reset email. Please try again.",
          );
        }

        return;
      }

      setResetMessage(
        "If this email belongs to a Prospherum staff account, a password reset link has been sent.",
      );
    } catch (error) {
      console.error("Password reset error:", error);
      setErrorMessage(
        "Unable to send the password reset email. Please try again.",
      );
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <img
                src="/branding/prospherum-logo.png"
                alt="Prospherum Skills Academy"
                className="h-20 w-auto object-contain"
              />
            </div>

            <p className="text-sm font-medium uppercase tracking-[0.2em] text-green-400">
              Prospherum Skills Academy
            </p>

            <h1 className="mt-3 text-3xl font-bold">
              Staff Portal
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              Sign in to manage learner applications.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
            {errorMessage && (
              <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            {resetMessage && (
              <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {resetMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  Staff email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrorMessage("");
                    setResetMessage("");
                  }}
                  required
                  autoComplete="email"
                  placeholder="name@prospherum.co.za"
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-green-500"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-200"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    className="text-xs font-medium text-green-400 transition hover:text-green-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resetLoading ? "Sending..." : "Forgot password?"}
                  </button>
                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrorMessage("");
                  }}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-green-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            Authorised Prospherum staff only.
          </p>
        </div>
      </div>
    </main>
  );
}