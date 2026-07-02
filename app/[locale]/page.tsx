import { getTranslations } from "next-intl/server";
import { LandingPage } from "@/components/landing/LandingPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function HomePage() {
  return <LandingPage />;
}
