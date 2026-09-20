"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const backgroundImages = [
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

export default function StaffLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  /* =========================================================
     BACKGROUND SLIDESHOW
     ========================================================= */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => {
        return (current + 1) % backgroundImages.length;
      });
    }, 5500);

    return () => window.clearInterval(interval);
  }, []);

  /* =========================================================
     STAFF LOGIN
     ========================================================= */

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

  /* =========================================================
     PASSWORD RESET
     ========================================================= */

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
      const redirectTo =
        `${window.location.origin}/staff/reset-password`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo,
          },
        );

      if (error) {
        console.error("Password reset error:", error);

        if (
          error.message
            .toLowerCase()
            .includes("rate limit")
        ) {
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
    <main className="relative min-h-screen overflow-hidden bg-[#050806] text-white">

      {/* =====================================================
          BACKGROUND SLIDESHOW
          ===================================================== */}

      <div
        aria-hidden="true"
        className="absolute inset-0"
      >
        {backgroundImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${
              index === activeImage
                ? "opacity-100"
                : "opacity-0"
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

        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Left-to-right dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/45" />

        {/* Bottom darkening */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/35" />

        {/* Subtle Prospherum green atmosphere */}
        <div className="absolute -right-40 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[150px]" />

        <div className="absolute -left-40 bottom-[-180px] h-[450px] w-[450px] rounded-full bg-emerald-400/[0.07] blur-[140px]" />
      </div>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">

        <div className="w-full max-w-[430px]">

          {/* =================================================
              LOGO / BRANDING
              ================================================= */}

          <div className="mb-7 text-center sm:mb-8">

            <div className="mb-5 flex justify-center">

              <div className="relative h-14 w-[210px] sm:h-16 sm:w-[230px]">

                <Image
                  src="/branding/prospherum_logo_trans3.png"
                  alt="Prospherum Skills Academy"
                  fill
                  priority
                  className="object-contain"
                />

              </div>

            </div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#b7e8cc] sm:text-[11px]">
              Prospherum Skills Academy
            </p>

            <h1 className="mt-2.5 text-2xl font-semibold tracking-tight sm:text-[28px]">
              Staff Portal
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/60">
              Secure access to learner applications and administration.
            </p>

          </div>

          {/* =================================================
              LOGIN CARD
              ================================================= */}

          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/45 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl">

            {/* Green top line */}

            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

            <div className="p-5 sm:p-7">

              {/* Error */}

              {errorMessage && (
                <div className="mb-5 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Reset message */}

              {resetMessage && (
                <div className="mb-5 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm leading-5 text-emerald-300">
                  {resetMessage}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70"
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
                    className="min-h-12 w-full rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-emerald-400/70 focus:bg-black/55 focus:ring-2 focus:ring-emerald-400/10"
                  />

                </div>

                {/* Password */}

                <div>

                  <div className="mb-2 flex items-center justify-between gap-3">

                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold uppercase tracking-wide text-white/70"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resetLoading}
                      className="text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {resetLoading
                        ? "Sending..."
                        : "Forgot password?"}
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
                    className="min-h-12 w-full rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-emerald-400/70 focus:bg-black/55 focus:ring-2 focus:ring-emerald-400/10"
                  />

                </div>

                {/* Sign in */}

                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-12 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/30 transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Signing in..."
                    : "Sign in"}
                </button>

              </form>

            </div>

          </div>

          {/* =================================================
              FOOTER
              ================================================= */}

          <div className="mt-5 text-center">

            <p className="text-[11px] text-white/40">
              Authorised Prospherum staff only.
            </p>

            <div className="mt-3 flex items-center justify-center gap-2">

              <span className="h-1 w-1 rounded-full bg-emerald-400/70" />

              <span className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                Secure staff access
              </span>

              <span className="h-1 w-1 rounded-full bg-emerald-400/70" />

            </div>

          </div>

          {/* =================================================
              SLIDESHOW INDICATORS
              ================================================= */}

          <div className="mt-5 flex justify-center gap-1.5">

            {backgroundImages.map((image, index) => (
              <span
                key={image}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === activeImage
                    ? "w-6 bg-emerald-400"
                    : "w-1 bg-white/30"
                }`}
              />
            ))}

          </div>

        </div>

      </div>

    </main>
  );
}