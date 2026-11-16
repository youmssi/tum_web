import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import {
  ComparisonSection,
  CtaSection,
  FeaturesSection,
  FooterSection,
  LandingNav,
  MarketingPageHeader,
} from "@/components/modules/landing-page";
import { ROUTES } from "@/lib/constants";
import { publicPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.pages.features" });
  return publicPageMetadata({
    locale,
    path: ROUTES.FEATURES,
    title: t("title"),
    description: t("description"),
  });
}

export default async function FeaturesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.pages.features" });
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <LandingNav />
      <MarketingPageHeader heading={t("heading")} intro={t("intro")} />
      <FeaturesSection />
      <ComparisonSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
