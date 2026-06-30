"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Shield,
  FileText,
  Briefcase,
  Factory,
  Recycle,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";

// ─── Navbar ───────────────────────────────────────────────────────────────────

function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-black/5 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#0F6E56] tracking-tight">E-PRid</span>
          <span className="hidden sm:inline text-xs text-[#374151]/50 font-medium border-l border-black/10 pl-2">
            Battery EPR Verification
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#374151]">
          <a href="#how-it-works" className="hover:text-[#0F6E56] transition-colors">
            How it works
          </a>
          <a href="#who-its-for" className="hover:text-[#0F6E56] transition-colors">
            For Producers
          </a>
          <a href="#who-its-for" className="hover:text-[#0F6E56] transition-colors">
            For Consultancies
          </a>
          <a
            href="#early-access"
            className="bg-[#D85A30] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-semibold"
          >
            Get Early Access
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-[#374151]"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-black/5 bg-white px-6 py-4 flex flex-col gap-4 text-sm font-medium text-[#374151]">
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="hover:text-[#0F6E56]">
            How it works
          </a>
          <a href="#who-its-for" onClick={() => setMenuOpen(false)} className="hover:text-[#0F6E56]">
            For Producers
          </a>
          <a href="#who-its-for" onClick={() => setMenuOpen(false)} className="hover:text-[#0F6E56]">
            For Consultancies
          </a>
          <a
            href="#early-access"
            onClick={() => setMenuOpen(false)}
            className="bg-[#D85A30] text-white px-4 py-2.5 rounded-md text-center font-semibold hover:opacity-90 transition-opacity"
          >
            Get Early Access
          </a>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-[#0F6E56]/8 text-[#0F6E56] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Shield className="h-3.5 w-3.5" />
          Built for BWMR 2022 compliance
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-[#374151] leading-tight tracking-tight mb-5">
          Know if your EPR certificate is real
          <span className="block text-[#0F6E56]">before you file.</span>
        </h1>

        <p className="text-lg text-[#374151]/65 max-w-2xl mx-auto leading-relaxed mb-10">
          India&apos;s plastic EPR system saw ₹700Cr+ in fraudulent certificates before
          anyone caught it. Battery EPR is next. E-PRid gives producers, PROs, and compliance
          consultancies a risk score on every recycler and certificate — before they buy.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href="/login"
            className="bg-[#D85A30] text-white px-7 py-3 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Run a Risk Check
          </Link>
          <a
            href="#how-it-works"
            className="border border-[#0F6E56] text-[#0F6E56] px-7 py-3 rounded-md font-semibold text-sm hover:bg-[#0F6E56]/5 transition-colors"
          >
            See how it works
          </a>
        </div>

        <p className="text-xs text-[#374151]/40 font-medium tracking-wide uppercase">
          Built for India&apos;s Battery Waste Management Rules, 2022
        </p>
      </div>
    </section>
  );
}

// ─── Problem bar ─────────────────────────────────────────────────────────────

const STATS = [
  {
    stat: "520+",
    desc: "Registered battery recyclers — with no independent verification layer",
  },
  {
    stat: "₹700Cr+",
    desc: "Fraudulent plastic EPR certs undetected. Battery EPR uses the same architecture.",
  },
  {
    stat: "June 30",
    desc: "Annual return deadline — with no way to verify what you're filing",
  },
];

function ProblemBar() {
  return (
    <section className="bg-[#0F6E56] py-14">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
        {STATS.map(({ stat, desc }) => (
          <div key={stat} className="text-center md:text-left">
            <p className="text-3xl md:text-4xl font-bold text-white mb-2">{stat}</p>
            <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Submit recycler name or certificate ID",
    desc: "Enter the recycler name, BWMR registration number, and batch details you want to verify. No portal access required.",
  },
  {
    number: "02",
    icon: Shield,
    title: "E-PRid runs three independent checks",
    desc: "Document forensics (EXIF, geotag, timestamps), capacity plausibility against public CPCB data, and regulatory history from enforcement databases.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Risk score and downloadable report",
    desc: "Get a Low / Medium / High risk rating with a per-check breakdown and a PDF report you can attach to your compliance file.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[#F9FAFB] py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[#374151] mb-3">How it works</h2>
          <p className="text-[#374151]/55 max-w-xl mx-auto text-sm leading-relaxed">
            Three checks, one report. Designed to be completed before a certificate purchase, not after.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map(({ number, icon: Icon, title, desc }) => (
            <div key={number} className="relative">
              {/* Connector line on desktop */}
              <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-[-50%] h-px bg-[#0F6E56]/15 last:hidden" />

              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-[#0F6E56]/10 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-[#0F6E56]" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0F6E56] text-white text-xs font-bold flex items-center justify-center">
                    {number.replace("0", "")}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#374151] mb-2">{title}</h3>
                  <p className="text-sm text-[#374151]/60 leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Who it's for ─────────────────────────────────────────────────────────────

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#7C3AED]/20">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Verified Recycler
    </span>
  );
}

const AUDIENCES = [
  {
    icon: Briefcase,
    title: "EPR Compliance Consultancies",
    body: "White-label the check. Run it for every client before filing. One bad certificate can cost your client an Environmental Compensation notice — and your firm its reputation.",
    badge: null,
  },
  {
    icon: Factory,
    title: "Producers & EV OEMs",
    body: "Your EPR obligation doesn't end at buying a certificate. If the recycler behind it is fraudulent, the liability lands on you. Verify before you file.",
    badge: null,
  },
  {
    icon: Recycle,
    title: "Recyclers",
    body: "Stand out from the crowd. Get a Verified Recycler badge that producers can trust — because you've passed an independent check, not just self-reported.",
    badge: <VerifiedBadge />,
  },
];

function WhoItsForSection() {
  return (
    <section id="who-its-for" className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[#374151] mb-3">Who it&apos;s for</h2>
          <p className="text-[#374151]/55 max-w-xl mx-auto text-sm leading-relaxed">
            Every participant in the EPR certificate chain has something at stake.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AUDIENCES.map(({ icon: Icon, title, body, badge }) => (
            <div
              key={title}
              className="rounded-xl border border-black/8 bg-[#F9FAFB] p-6 flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-[#0F6E56]/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-[#0F6E56]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#374151] mb-2">{title}</h3>
                <p className="text-sm text-[#374151]/60 leading-relaxed">{body}</p>
              </div>
              {badge && <div>{badge}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Early access ─────────────────────────────────────────────────────────────

function EarlyAccessSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Email us directly: sake.winz@gmail.com");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="early-access" className="bg-[#111827] py-20">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Get early access</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-10 max-w-lg mx-auto">
          We&apos;re onboarding a small group of compliance consultancies and producers for the
          pilot. No commitment — just a risk check on the recycler of your choice.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 bg-[#0F6E56]/20 text-[#0F6E56] border border-[#0F6E56]/30 rounded-lg px-6 py-4 text-sm font-medium">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            We&apos;ll be in touch. Watch your inbox.
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-md border border-white/15 bg-white/5 text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#D85A30] text-white px-6 py-3 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? "Sending…" : "Request Access"}
              </button>
            </form>
            {error && (
              <p className="mt-4 text-sm text-red-400">{error}</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#F9FAFB] border-t border-black/8 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-[#374151]">E-PRid — EPR Certificate Verification</p>
          <p className="text-xs text-[#374151]/45 mt-1">
            Built for India&apos;s Battery Waste Management Rules, 2022
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-[#374151]/50">
          <Link href="/privacy" className="hover:text-[#374151] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-[#374151] transition-colors">
            Terms of Service
          </Link>
          <Link href="/login" className="text-[#0F6E56] font-medium hover:underline flex items-center gap-1">
            Log in <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <HeroSection />
      <ProblemBar />
      <HowItWorksSection />
      <WhoItsForSection />
      <EarlyAccessSection />
      <Footer />
    </div>
  );
}
