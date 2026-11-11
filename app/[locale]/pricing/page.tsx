import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import {
  ComparisonSection,
  CtaSection,
  FooterSection,
  LandingNav,
  MarketingPageHeader,
  PricingSection,
} from "@/components/modules/landing-page";
import { localizedUrl, type Locale } from "@/i18n/routing";
import { PLAN_PRICES, ROUTES } from "@/lib/constants";
import { env } from "@/lib/env";
import { publicPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.pages.pricing" });
  return publicPageMetadata({
    locale,
    path: ROUTES.PRICING,
    title: t("title"),
    description: t("description"),
  });
}

async function structuredData(locale: string) {
  const t = await getTranslations({ locale, namespace: "landing.pages.pricing" });
  const plans = await getTranslations({ locale, namespace: "landing.pricing.plans" });
  const url = localizedUrl(locale as Locale, ROUTES.PRICING);
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Tûm",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Self-hosted (Docker)",
    url,
    description: t("description"),
    publisher: { "@id": `${env.siteUrl}/#organization` },
    offers: (Object.keys(PLAN_PRICES) as (keyof typeof PLAN_PRICES)[]).map((key) => ({
      "@type": "Offer",
      name: plans(`${key}.name`),
      description: plans(`${key}.description`),
      price: String(PLAN_PRICES[key].monthly),
      priceCurrency: "USD",
      url,
    })),
  };
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.pages.pricing" });
  const jsonLd = await structuredData(locale);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="relative min-h-screen overflow-x-hidden">
        <LandingNav />
        <MarketingPageHeader heading={t("heading")} intro={t("intro")} />
        <PricingSection />
        <ComparisonSection />
        <CtaSection />
        <FooterSection />
      </main>
    </>
  );
}
