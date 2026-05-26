import {
  LandingNav,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  CtaSection,
  FooterSection,
} from "@/components/modules/landing-page";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
