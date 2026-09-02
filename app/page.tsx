import Image from "next/image";
import Link from "next/link";

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

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[var(--prospherum-text)]">
      {/* Header */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex min-w-0 shrink items-center gap-3"
            aria-label="Prospherum home"
          >
            <div className="relative h-10 w-36 shrink-0 sm:h-12 sm:w-48">
              <Image
                src="/branding/prospherum-logo.png"
                alt="Prospherum Skills Academy"
                fill
                priority
                className="object-contain object-left"
              />
            </div>

            {/* Desktop brand text */}
            <div className="hidden sm:block">
              <div className="text-lg font-bold tracking-tight">
                Prospherum
              </div>

              <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--prospherum-muted)]">
                Skills Academy
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link
              href="#about"
              className="transition-colors hover:text-[var(--prospherum-green)]"
            >
              About
            </Link>

            <Link
              href="#how-it-works"
              className="transition-colors hover:text-[var(--prospherum-green)]"
            >
              How It Works
            </Link>

            <Link
              href="#contact"
              className="transition-colors hover:text-[var(--prospherum-green)]"
            >
              Contact
            </Link>

            <Link
              href="/staff/login"
              className="border border-[var(--prospherum-black)] px-5 py-2.5 transition-colors hover:bg-[var(--prospherum-black)] hover:text-white"
            >
              Staff Login
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex shrink-0 items-center gap-1.5 md:hidden">
            <Link
              href="/staff/login"
              className="whitespace-nowrap border border-black/15 px-2.5 py-2 text-[11px] font-semibold text-[var(--prospherum-black)] transition-colors hover:border-[var(--prospherum-green)] hover:bg-[var(--prospherum-green-light)] hover:text-[var(--prospherum-green)]"
            >
              Staff Sign In
            </Link>

            <Link
              href="/apply"
              className="whitespace-nowrap bg-[var(--prospherum-green)] px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[var(--prospherum-green-dark)]"
            >
              Apply
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--prospherum-black)] text-white">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[var(--prospherum-green)] opacity-90 [clip-path:polygon(35%_0,100%_0,100%_100%,0_100%)]" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-[var(--prospherum-green-light)]">
              Prospherum Skills Academy
            </p>

            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Skills, opportunity and a pathway to your future.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">
              Discover funded training opportunities and take the next step
              towards qualifications, workplace experience and meaningful
              opportunities.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/apply"
                className="inline-flex items-center justify-center bg-[var(--prospherum-green)] px-7 py-4 font-bold text-white transition-colors hover:bg-[var(--prospherum-green-dark)]"
              >
                Apply for an Opportunity
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center border border-white/30 px-7 py-4 font-semibold text-white transition-colors hover:bg-white hover:text-[var(--prospherum-black)]"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--prospherum-green)]">
              About Prospherum
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              More than a qualification.
            </h2>

            <div className="mt-6 space-y-5 text-base leading-7 text-[var(--prospherum-muted)]">
              <p>
                Prospherum is a South African non-profit organisation focused
                on supporting people through funded training opportunities and
                learner development.
              </p>

              <p>
                The organisation works to identify learning opportunities,
                improve learner selection and provide support that helps
                learners succeed during and after their training.
              </p>

              <p>
                Our goal is to help people develop skills that can contribute
                to themselves, their families, their communities and the
                country.
              </p>
            </div>
          </div>

          <div className="bg-[var(--prospherum-green-light)] p-8 sm:p-10">
            <div className="border-l-4 border-[var(--prospherum-green)] pl-6">
              <p className="text-xl font-semibold leading-8 text-[var(--prospherum-text)]">
                “Your success is our success.”
              </p>

              <p className="mt-4 text-sm leading-6 text-[var(--prospherum-muted)]">
                Prospherum supports learners with more than training alone,
                including selection, learner support and tools that can help
                prepare them for the world of work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-[var(--prospherum-grey)]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--prospherum-green)]">
              Simple application process
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Start your application in a few simple steps.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white p-7 shadow-sm ring-1 ring-black/5"
              >
                <div className="text-sm font-black text-[var(--prospherum-green)]">
                  {step.number}
                </div>

                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>

                <p className="mt-3 text-sm leading-6 text-[var(--prospherum-muted)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/apply"
              className="inline-flex bg-[var(--prospherum-green)] px-7 py-4 font-bold text-white transition-colors hover:bg-[var(--prospherum-green-dark)]"
            >
              Start Your Application
            </Link>
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8 lg:py-24">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--prospherum-green)]">
            Ready to take the next step?
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Your next opportunity could start here.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-[var(--prospherum-muted)]">
            Apply when a suitable Prospherum opportunity is available and
            submit your information securely for consideration.
          </p>

          <div className="mt-8">
            <Link
              href="/apply"
              className="inline-flex bg-[var(--prospherum-black)] px-8 py-4 font-bold text-white transition-colors hover:bg-[var(--prospherum-green)]"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--prospherum-black)] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-bold">Prospherum</div>

            <div className="mt-1 text-sm text-white/60">
              Skills Development Fund
            </div>
          </div>

          <div className="text-sm text-white/60">
            © {new Date().getFullYear()} Prospherum. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}