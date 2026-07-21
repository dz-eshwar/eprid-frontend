"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
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
  Battery,
  Droplet,
  Clock,
} from "lucide-react";
import { EPRidMark } from "@/components/branding/EPRidLogo";

// ─── Navbar ───────────────────────────────────────────────────────────────────

function LandingNavbar() {
  const t = useTranslations("landing.nav");
  const tLang = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLocaleChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  const languageSelect = (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => handleLocaleChange(e.target.value)}
      className="bg-black/5 hover:bg-black/10 rounded-md px-2 py-1.5 text-sm font-medium border-none outline-none cursor-pointer text-[#374151] shrink-0"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {tLang(loc)}
        </option>
      ))}
    </select>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-black/5 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <EPRidMark size={26} color="#0F6E56" />
          <span className="text-xl font-bold text-[#374151] tracking-tight">
            EPR<span className="text-[#D85A30]">I</span>d
          </span>
          <span className="hidden sm:inline text-xs text-[#374151]/50 font-medium border-l border-black/10 pl-2">
            {t("tagline")}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#374151]">
          <a href="#how-it-works" className="hover:text-[#0F6E56] transition-colors">
            {t("howItWorks")}
          </a>
          <a href="#who-its-for" className="hover:text-[#0F6E56] transition-colors">
            {t("forProducers")}
          </a>
          <a href="#who-its-for" className="hover:text-[#0F6E56] transition-colors">
            {t("forConsultancies")}
          </a>
          <Link href="/used-oil" className="hover:text-[#0F6E56] transition-colors">
            {t("usedOil")}
          </Link>
          <a href="#now-and-next" className="hover:text-[#0F6E56] transition-colors">
            {t("roadmap")}
          </a>
          <Link
            href="/register"
            className="bg-[#D85A30] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-semibold"
          >
            {t("tryNow")}
          </Link>
          {languageSelect}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-3">
          {languageSelect}
          <button
            className="text-[#374151]"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={t("toggleMenu")}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-black/5 bg-white px-6 py-4 flex flex-col gap-4 text-sm font-medium text-[#374151]">
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="hover:text-[#0F6E56]">
            {t("howItWorks")}
          </a>
          <a href="#who-its-for" onClick={() => setMenuOpen(false)} className="hover:text-[#0F6E56]">
            {t("forProducers")}
          </a>
          <a href="#who-its-for" onClick={() => setMenuOpen(false)} className="hover:text-[#0F6E56]">
            {t("forConsultancies")}
          </a>
          <Link href="/used-oil" onClick={() => setMenuOpen(false)} className="hover:text-[#0F6E56]">
            {t("usedOil")}
          </Link>
          <a href="#now-and-next" onClick={() => setMenuOpen(false)} className="hover:text-[#0F6E56]">
            {t("roadmap")}
          </a>
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="bg-[#D85A30] text-white px-4 py-2.5 rounded-md text-center font-semibold hover:opacity-90 transition-opacity"
          >
            {t("tryNow")}
          </Link>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-[#0F6E56]/8 text-[#0F6E56] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Shield className="h-3.5 w-3.5" />
          {t("badge")}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-[#374151] leading-tight tracking-tight mb-5">
          {t("titleLine1")}
          <span className="block text-[#0F6E56]">{t("titleLine2")}</span>
        </h1>

        <p className="text-lg text-[#374151]/65 max-w-2xl mx-auto leading-relaxed mb-10">
          {t("body")}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href="/login"
            className="bg-[#D85A30] text-white px-7 py-3 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            {t("ctaPrimary")}
          </Link>
          <a
            href="#how-it-works"
            className="border border-[#0F6E56] text-[#0F6E56] px-7 py-3 rounded-md font-semibold text-sm hover:bg-[#0F6E56]/5 transition-colors"
          >
            {t("ctaSecondary")}
          </a>
        </div>

        <p className="text-xs text-[#374151]/40 font-medium tracking-wide uppercase">
          {t("footnote")}
        </p>
      </div>
    </section>
  );
}

// ─── Problem bar ─────────────────────────────────────────────────────────────

const STAT_KEYS = ["recyclers", "fraud", "deadline"] as const;

function ProblemBar() {
  const t = useTranslations("landing.stats");

  return (
    <section className="bg-[#0F6E56] py-14">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
        {STAT_KEYS.map((key) => (
          <div key={key} className="text-center md:text-left">
            <p className="text-3xl md:text-4xl font-bold text-white mb-2">{t(`${key}.stat`)}</p>
            <p className="text-sm text-white/70 leading-relaxed">{t(`${key}.desc`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Waste streams ---

const STREAM_KEYS = [
  { key: "battery", icon: Battery, href: "/verify" },
  { key: "tyre", icon: Recycle, href: "/verify" },
  { key: "usedOil", icon: Droplet, href: "/used-oil" },
] as const;

function StreamsSection() {
  const t = useTranslations("landing.streams");

  return (
    <section className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[#374151] mb-3">{t("heading")}</h2>
          <p className="text-[#374151]/55 max-w-xl mx-auto text-sm leading-relaxed">
            {t("subheading")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STREAM_KEYS.map(({ key, icon: Icon, href }) => (
            <div
              key={key}
              className="rounded-xl border border-black/8 bg-[#F9FAFB] p-6 flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-[#0F6E56]/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-[#0F6E56]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#374151] mb-2">{t(`items.${key}.title`)}</h3>
                <p className="text-sm text-[#374151]/60 leading-relaxed">{t(`items.${key}.body`)}</p>
              </div>
              <Link
                href={href}
                className="text-sm font-semibold text-[#0F6E56] hover:underline inline-flex items-center gap-1"
              >
                {t(`items.${key}.cta`)} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

const STEP_KEYS = [
  { key: "submit", number: "01", icon: Search },
  { key: "checks", number: "02", icon: Shield },
  { key: "score", number: "03", icon: FileText },
] as const;

function HowItWorksSection() {
  const t = useTranslations("landing.howItWorks");

  return (
    <section id="how-it-works" className="bg-[#F9FAFB] py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[#374151] mb-3">{t("heading")}</h2>
          <p className="text-[#374151]/55 max-w-xl mx-auto text-sm leading-relaxed">
            {t("subheading")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEP_KEYS.map(({ key, number, icon: Icon }) => (
            <div key={key} className="relative">
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
                  <h3 className="font-semibold text-[#374151] mb-2">{t(`steps.${key}.title`)}</h3>
                  <p className="text-sm text-[#374151]/60 leading-relaxed">{t(`steps.${key}.desc`)}</p>
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
  const t = useTranslations("landing.whoItsFor");
  return (
    <a
      href="#now-and-next"
      className="inline-flex items-center gap-1.5 bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#7C3AED]/20 hover:bg-[#7C3AED]/15 transition-colors"
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      {t("verifiedBadge")}
    </a>
  );
}

const AUDIENCE_KEYS = [
  { key: "consultancies", icon: Briefcase, badge: false },
  { key: "producers", icon: Factory, badge: false },
  { key: "recyclers", icon: Recycle, badge: true },
] as const;

function WhoItsForSection() {
  const t = useTranslations("landing.whoItsFor");

  return (
    <section id="who-its-for" className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[#374151] mb-3">{t("heading")}</h2>
          <p className="text-[#374151]/55 max-w-xl mx-auto text-sm leading-relaxed">
            {t("subheading")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AUDIENCE_KEYS.map(({ key, icon: Icon, badge }) => (
            <div
              key={key}
              className="rounded-xl border border-black/8 bg-[#F9FAFB] p-6 flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-[#0F6E56]/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-[#0F6E56]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#374151] mb-2">{t(`audiences.${key}.title`)}</h3>
                <p className="text-sm text-[#374151]/60 leading-relaxed">{t(`audiences.${key}.body`)}</p>
              </div>
              {badge && <div><VerifiedBadge /></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Now / Next ───────────────────────────────────────────────────────────────

const NOW_KEYS = ["riskCheck", "calculator", "directory", "vault", "usedOil", "tyreCheck"] as const;
const NEXT_KEYS = ["formChecklist", "verifiedBadge", "invoiceChecks", "tyreExpansion"] as const;

function NowNextSection() {
  const t = useTranslations("landing.nowNext");

  return (
    <section id="now-and-next" className="bg-[#F9FAFB] py-20 border-t border-black/5">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[#374151] mb-3">{t("heading")}</h2>
          <p className="text-[#374151]/55 max-w-xl mx-auto text-sm leading-relaxed">
            {t("subheading")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-semibold text-[#0F6E56] uppercase tracking-wide mb-4">
              {t("nowLabel")}
            </p>
            <ul className="space-y-4">
              {NOW_KEYS.map((key) => (
                <li
                  key={key}
                  className="flex items-start gap-3 rounded-lg bg-white border border-black/5 p-4"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#0F6E56] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#374151]">{t(`now.${key}.title`)}</p>
                    <p className="text-xs text-[#374151]/55 mt-0.5 leading-relaxed">
                      {t(`now.${key}.desc`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#374151]/50 uppercase tracking-wide mb-4">
              {t("nextLabel")}
            </p>
            <ul className="space-y-4">
              {NEXT_KEYS.map((key) => (
                <li
                  key={key}
                  className="flex items-start gap-3 rounded-lg bg-white/60 border border-dashed border-black/10 p-4"
                >
                  <Clock className="h-4 w-4 text-[#374151]/35 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#374151]/70">{t(`next.${key}.title`)}</p>
                    <p className="text-xs text-[#374151]/45 mt-0.5 leading-relaxed">
                      {t(`next.${key}.desc`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Get started ──────────────────────────────────────────────────────────────

function GetStartedSection() {
  const t = useTranslations("landing.getStarted");

  return (
    <section id="get-started" className="bg-[#111827] py-20">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{t("heading")}</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-10 max-w-lg mx-auto">
          {t("body")}
        </p>

        <Link
          href="/register"
          className="inline-block bg-[#D85A30] text-white px-7 py-3 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {t("cta")}
        </Link>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const t = useTranslations("landing.footer");
  return (
    <footer className="bg-[#F9FAFB] border-t border-black/8 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-[#374151]">{t("title")}</p>
          <p className="text-xs text-[#374151]/45 mt-1">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-[#374151]/50">
          <a href="#now-and-next" className="hover:text-[#374151] transition-colors">
            {t("roadmap")}
          </a>
          <Link href="/privacy" className="hover:text-[#374151] transition-colors">
            {t("privacyPolicy")}
          </Link>
          <Link href="/terms" className="hover:text-[#374151] transition-colors">
            {t("termsOfService")}
          </Link>
          <Link href="/login" className="text-[#0F6E56] font-medium hover:underline flex items-center gap-1">
            {t("login")} <ArrowRight className="h-3.5 w-3.5" />
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
      <StreamsSection />
      <HowItWorksSection />
      <WhoItsForSection />
      <NowNextSection />
      <GetStartedSection />
      <Footer />
    </div>
  );
}
