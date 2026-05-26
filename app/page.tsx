import type { Metadata } from "next";
import {
  LandingNav,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  CtaSection,
  FooterSection,
} from "@/components/modules/landing-page";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: {
    absolute: "Tûm — Project execution & workflow visibility",
  },
  description:
    "Tûm brings tasks, timelines, and team visibility into one coherent workspace. No more scattered tools — just clear execution. For any team, any department, any project.",
  alternates: {
    canonical: env.siteUrl,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tûm",
  url: env.siteUrl,
  description:
    "Tûm brings tasks, timelines, and team visibility into one coherent workspace. No more scattered tools — just clear execution.",
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="relative min-h-screen overflow-x-hidden">
        <LandingNav />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <CtaSection />
        <FooterSection />
      </main>
    </>
  );
}
