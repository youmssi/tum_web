import type { Metadata } from "next";
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
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: {
    absolute: "Tûm — Open-source project execution & workflow visibility platform",
  },
  description:
    "Tûm brings tasks, timelines, Gantt charts, and team visibility into one coherent workspace. Smart scheduling, critical path analysis, workload views, Kanban board, and real-time collaboration. Self-host or cloud — no vendor lock-in.",
  alternates: {
    canonical: env.siteUrl,
  },
  openGraph: {
    title: "Tûm — Open-source project execution platform",
    description:
      "Smart scheduling, Gantt charts, Kanban boards, workload views, and real-time collaboration in one open-source workspace.",
    url: env.siteUrl,
    siteName: "Tûm",
  },
  twitter: {
    title: "Tûm — Open-source project execution platform",
    description:
      "Smart scheduling, Gantt charts, Kanban boards, workload views, and real-time collaboration in one open-source workspace.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Tûm",
  applicationCategory: "Project Management",
  operatingSystem: "Web, Self-hosted (Docker)",
  url: env.siteUrl,
  description:
    "Tûm brings tasks, timelines, Gantt charts, and team visibility into one coherent workspace. Smart scheduling, critical path analysis, workload views, Kanban board, and real-time collaboration. Open-source with fair-code license.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free self-hosted version. Cloud plans from $17/mo.",
  },
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
