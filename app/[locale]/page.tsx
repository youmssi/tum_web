import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  LandingNav,
  HeroSection,
  GanttDemoSection,
  FeaturesSection,
  ComparisonSection,
  BuiltForSection,
  HowItWorksSection,
  PricingSection,
  TestimonialsSection,
  CtaSection,
  FooterSection,
} from "@/components/modules/landing-page";
import { COMPANY, CONTACT } from "@/lib/constants";
import { env } from "@/lib/env";
import { routing, localizedUrl, type Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.seo" });
  const canonical = localizedUrl(locale as Locale);

  return {
    title: { absolute: t("title") },
    description: t("description"),
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l)])),
        "x-default": env.siteUrl,
      },
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: canonical,
      siteName: "Tûm",
      locale,
    },
    twitter: {
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
  };
}

async function structuredData(locale: string) {
  const t = await getTranslations({ locale, namespace: "landing.seo" });
  const url = localizedUrl(locale as Locale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${env.siteUrl}/#organization`,
        name: COMPANY.TRADE_NAME,
        url: COMPANY.URL,
        legalName: COMPANY.NAME,
        taxID: COMPANY.TAX_ID,
        address: {
          "@type": "PostalAddress",
          streetAddress: COMPANY.ADDRESS,
          addressCountry: COMPANY.COUNTRY_CODE,
        },
        contactPoint: [
          { "@type": "ContactPoint", contactType: "sales", email: CONTACT.EMAIL },
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: CONTACT.SUPPORT_EMAIL,
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${url}/#software`,
        name: "Tûm",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, Self-hosted (Docker)",
        url,
        image: `${env.siteUrl}/icon.png`,
        publisher: { "@id": `${env.siteUrl}/#organization` },
        description: t("description"),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free self-hosted version. Cloud plans from $17/mo.",
        },
      },
    ],
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const jsonLd = await structuredData(locale);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="relative min-h-screen overflow-x-hidden">
        <LandingNav />
        <HeroSection />
        <GanttDemoSection />
        <BuiltForSection />
        <FeaturesSection />
        <ComparisonSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <CtaSection />
        <FooterSection />
      </main>
    </>
  );
}
