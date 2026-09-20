"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const heroImages = [
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

const steps = [
  {
    number: "01",
    title: "Complete your application",
    description:
      "Tell us about yourself, your education and the opportunity you are interested in.",
  },
  {
    number: "02",
    title: "Upload your documents",
    description:
      "Submit your CV and the supporting documents required for the opportunity.",
  },
  {
    number: "03",
    title: "Submit your application",
    description:
      "Review your information and submit your application securely.",
  },
  {
    number: "04",
    title: "Receive your reference",
    description:
      "Your unique application reference number will be displayed and sent to your email.",
  },
];

function GreenMist() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="prospherum-mist prospherum-mist-1" />
      <div className="prospherum-mist prospherum-mist-2" />
      <div className="prospherum-mist prospherum-mist-3" />
    </div>
  );
}

export default function Home() {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[var(--prospherum-text)]">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="absolute left-0 top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8 sm:py-4">

          {/* Logo */}

          <Link
            href="/"
            className="relative flex h-9 w-36 shrink-0 items-center sm:h-11 sm:w-48"
            aria-label="Prospherum home"
          >
            <Image
              src="/branding/prospherum_logo_trans3.png"
              alt="Prospherum Skills Academy"
              fill
              priority
              className="object-contain object-left"
            />
          </Link>

          {/* Desktop Navigation */}

          <nav className="hidden items-center gap-7 text-sm font-medium text-white md:flex">

            <Link
              href="#about"
              className="transition-colors hover:text-[#b7e8cc]"
            >
              About
            </Link>

            <Link
              href="#how-it-works"
              className="transition-colors hover:text-[#b7e8cc]"
            >
              How It Works
            </Link>

            <Link
              href="#contact"
              className="transition-colors hover:text-[#b7e8cc]"
            >
              Contact
            </Link>

            <Link
              href="/staff/login"
              className="rounded-full border border-white/30 px-5 py-2 transition-all hover:border-white hover:bg-white hover:text-black"
            >
              Staff Login
            </Link>

            <Link
              href="/apply"
              className="rounded-full bg-[var(--prospherum-green)] px-5 py-2 text-white transition-all hover:bg-[var(--prospherum-green-dark)]"
            >
              Apply Now
            </Link>

          </nav>

          {/* Mobile Navigation */}

          <div className="flex shrink-0 items-center gap-2 md:hidden">

            <Link
              href="/staff/login"
              className="rounded-full border border-white/30 px-3 py-2 text-[11px] font-semibold text-white"
            >
              Staff
            </Link>

            <Link
              href="/apply"
              className="rounded-full bg-[var(--prospherum-green)] px-3.5 py-2 text-[11px] font-bold text-white"
            >
              Apply
            </Link>

          </div>

        </div>
      </header>

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="relative flex min-h-[680px] items-center overflow-hidden bg-[#07100c] text-white sm:min-h-[720px]">

        {/* Slideshow */}

        {heroImages.map((image, index) => (
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

        {/* Cinematic overlay */}

        <div className="absolute inset-0 bg-black/55" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />

        {/* Green atmospheric glow */}

        <div className="absolute -right-32 top-1/3 h-72 w-72 rounded-full bg-[var(--prospherum-green)]/20 blur-[110px]" />

        {/* Hero content */}

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-36">

          <div className="max-w-2xl">

            <div className="mb-5 flex items-center gap-3">

              <span className="h-px w-8 bg-[var(--prospherum-green)]" />

              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#b7e8cc] sm:text-xs">
                Prospherum Skills Academy
              </p>

            </div>

            <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-0.025em] sm:text-5xl lg:text-[3.5rem]">
              Skills. Opportunity.

              <span className="block text-[#b7e8cc]">
                Your Future.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
              Discover funded training opportunities and take the next
              step towards qualifications, workplace experience and
              meaningful opportunities.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/apply"
                className="inline-flex items-center justify-center rounded-full bg-[var(--prospherum-green)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[var(--prospherum-green-dark)]"
              >
                Apply Now
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-black"
              >
                How It Works
              </Link>

            </div>

          </div>

          {/* Slideshow indicators */}

          <div className="mt-12 flex items-center gap-1.5">

            {heroImages.map((image, index) => (
              <span
                key={image}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === activeImage
                    ? "w-7 bg-[var(--prospherum-green)]"
                    : "w-1.5 bg-white/35"
                }`}
              />
            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          ABOUT
          ===================================================== */}

      <section
        id="about"
        className="relative overflow-hidden bg-white"
      >

        <GreenMist />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-20">

          <div>

            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--prospherum-green)]">
              About Prospherum
            </p>

            <h2 className="mt-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
              More than a qualification.
            </h2>

            <div className="mt-4 max-w-xl space-y-3 text-sm leading-6 text-[var(--prospherum-muted)]">

              <p>
                Prospherum is a South African non-profit organisation
                focused on supporting people through funded training
                opportunities and learner development.
              </p>

              <p>
                The organisation works to identify learning
                opportunities, improve learner selection and provide
                support that helps learners succeed during and after
                their training.
              </p>

              <p>
                Our goal is to help people develop skills that can
                contribute to themselves, their families, their
                communities and the country.
              </p>

            </div>

          </div>

          {/* Highlight */}

          <div className="relative overflow-hidden rounded-2xl bg-[#edf9f2] p-7 sm:p-9">

            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[var(--prospherum-green)]/15 blur-3xl" />

            <div className="relative border-l-2 border-[var(--prospherum-green)] pl-5">

              <p className="text-lg font-semibold leading-7 text-[var(--prospherum-text)] sm:text-xl">
                “Your success is our success.”
              </p>

              <p className="mt-3 text-sm leading-6 text-[var(--prospherum-muted)]">
                Prospherum supports learners with more than training
                alone, including selection, learner support and tools
                that can help prepare them for the world of work.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          HOW IT WORKS
          ===================================================== */}

      <section
        id="how-it-works"
        className="relative overflow-hidden bg-[#f4f7f5]"
      >

        <GreenMist />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:py-20">

          <div className="max-w-xl">

            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--prospherum-green)]">
              Simple application process
            </p>

            <h2 className="mt-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
              Start your application in a few simple steps.
            </h2>

          </div>

          {/* Steps */}

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {steps.map((step) => (
              <div
                key={step.number}
                className="group rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >

                <div className="flex items-center justify-between">

                  <span className="text-xs font-black tracking-wider text-[var(--prospherum-green)]">
                    {step.number}
                  </span>

                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--prospherum-green)]/50 transition-all group-hover:w-5" />

                </div>

                <h3 className="mt-5 text-base font-bold">
                  {step.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-[var(--prospherum-muted)]">
                  {step.description}
                </p>

              </div>
            ))}

          </div>

          <div className="mt-7">

            <Link
              href="/apply"
              className="inline-flex rounded-full bg-[var(--prospherum-green)] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[var(--prospherum-green-dark)]"
            >
              Start Your Application
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTACT / CTA
          ===================================================== */}

      <section
        id="contact"
        className="relative overflow-hidden bg-[#09120e] text-white"
      >

        <div className="absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[var(--prospherum-green)]/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-14 text-center sm:px-8 sm:py-16 lg:py-20">

          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b7e8cc]">
            Ready to take the next step?
          </p>

          <h2 className="mx-auto mt-2.5 max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
            Your next opportunity could start here.
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/65">
            Apply when a suitable Prospherum opportunity is available
            and submit your information securely for consideration.
          </p>

          <div className="mt-6">

            <Link
              href="/apply"
              className="inline-flex rounded-full bg-[var(--prospherum-green)] px-7 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--prospherum-green-dark)]"
            >
              Apply Now
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="bg-[#050806] text-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="font-semibold">
              Prospherum
            </div>

            <div className="mt-0.5 text-xs text-white/45">
              Skills Development Fund
            </div>

          </div>

          <div className="text-xs text-white/40">
            © {new Date().getFullYear()} Prospherum. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  );
}