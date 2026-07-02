"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { LogOut, Menu, User, X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { EPRidMark } from "@/components/branding/EPRidLogo";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function Navbar() {
  const { user, clearAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const tLang = useTranslations("language");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    clearAuth();
    setMenuOpen(false);
    router.push("/login");
  }

  function handleLocaleChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  const languageSelect = (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => handleLocaleChange(e.target.value)}
      className="bg-white/15 hover:bg-white/25 rounded-md px-2 py-1 text-sm font-medium border-none outline-none cursor-pointer shrink-0"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc} className="text-black">
          {tLang(loc)}
        </option>
      ))}
    </select>
  );

  return (
    <nav className="bg-[#0F6E56] text-white px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <EPRidMark size={28} color="#ffffff" />
          <span className="text-xl font-bold tracking-tight">EPRId</span>
          <span className="hidden lg:inline text-sm font-normal opacity-75 truncate">
            {t("tagline")}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {user?.role !== "RECYCLER" && (
            <Link href="/calculator" className="opacity-90 hover:opacity-100 font-medium">
              {t("calculator")}
            </Link>
          )}
          {user?.role !== "RECYCLER" && (
            <Link href="/verify" className="opacity-90 hover:opacity-100 font-medium">
              {t("verify")}
            </Link>
          )}
          <Link href="/vault" className="opacity-90 hover:opacity-100 font-medium">
            {t("vault")}
          </Link>

          {languageSelect}

          {user ? (
            <div className="flex items-center gap-3 border-l border-white/20 pl-4">
              <Link href="/dashboard" className="opacity-75 hover:opacity-100 font-medium">
                {t("dashboard")}
              </Link>
              <div className="flex items-center gap-1.5 text-white/80">
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">{user.fullName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 opacity-75 hover:opacity-100 transition-opacity"
                title={t("logout")}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-white/20 pl-4">
              <Link href="/login" className="opacity-90 hover:opacity-100 font-medium">
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap"
              >
                {t("signup")}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-3 shrink-0">
          {languageSelect}
          <button
            className="text-white"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={t("toggleMenu")}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/15 flex flex-col gap-4 text-sm">
          {user?.role !== "RECYCLER" && (
            <Link href="/calculator" onClick={() => setMenuOpen(false)} className="opacity-90 hover:opacity-100 font-medium">
              {t("calculator")}
            </Link>
          )}
          {user?.role !== "RECYCLER" && (
            <Link href="/verify" onClick={() => setMenuOpen(false)} className="opacity-90 hover:opacity-100 font-medium">
              {t("verify")}
            </Link>
          )}
          <Link href="/vault" onClick={() => setMenuOpen(false)} className="opacity-90 hover:opacity-100 font-medium">
            {t("vault")}
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="opacity-75 hover:opacity-100 font-medium">
                {t("dashboard")}
              </Link>
              <div className="flex items-center gap-1.5 text-white/80 pt-2 border-t border-white/15">
                <User className="h-4 w-4" />
                <span>{user.fullName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 opacity-75 hover:opacity-100 transition-opacity"
              >
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-2 border-t border-white/15">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="opacity-90 hover:opacity-100 font-medium">
                {t("login")}
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-md font-medium transition-colors text-center"
              >
                {t("signup")}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
