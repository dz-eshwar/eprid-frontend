import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import "../globals.css";
import { NavbarWrapper } from "@/components/layout/NavbarWrapper";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { routing } from "@/i18n/routing";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-PRid — Battery EPR Verification",
  description:
    "Estimate your battery EPR obligation and verify recycler certificates under BWMR 2022.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className={inter.className}>
      <body>
        <NextIntlClientProvider>
          <AuthProvider>
            <NavbarWrapper />
            <main className="min-h-screen">{children}</main>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
