"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, CalendarDays, GitMerge, ListChecks, Route, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

// Animated word keys — actual strings resolved from the active locale's catalog at render time
const WORD_KEYS = ["execute", "deliver", "track", "succeed"] as const;

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {[...Array(8)].map((_, i) => (
        <div
          key={`h-${i}`}
          className="absolute h-px bg-foreground/20"
          style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
        />
      ))}
      {[...Array(10)].map((_, i) => (
        <div
          key={`v-${i}`}
          className="absolute w-px bg-foreground/20"
          style={{ left: `${10 * (i + 1)}%`, top: 0, bottom: 0 }}
        />
      ))}
    </div>
  );
}

/** Heading + CTA + micro-footer — shared by desktop & mobile layouts. */
function HeroHeadingContent({
  t,
  words,
  wordIdx,
  visible,
}: {
  t: (key: string) => string;
  words: (key: string) => string;
  wordIdx: number;
  visible: boolean;
}) {
  return (
    <div>
      <h1
        className={`text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 transition-all duration-1000 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {t("headingLine1")}
        <br />
        {t("headingLine2")}{" "}
        <span className="relative inline-block text-primary">
          <span key={wordIdx} className="inline-flex">
            {words(WORD_KEYS[wordIdx])
              .split("")
              .map((ch, i) => (
                <span
                  key={`${wordIdx}-${i}`}
                  className="inline-block animate-[fadeInUp_0.4s_both]"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {ch}
                </span>
              ))}
          </span>
          <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/40 rounded-full" />
        </span>
      </h1>

      <p
        className={`text-lg text-muted-foreground leading-relaxed max-w-lg mb-10 transition-all duration-700 delay-200 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {t("subhead")}
      </p>

      <div
        className={`flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Button size="lg" className="h-12 px-8 rounded-full group" asChild>
          <Link href={ROUTES.SIGNUP}>
            {t("ctaStartFree")}
            <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="h-12 px-8 rounded-full" asChild>
          <Link href={ROUTES.LOGIN}>{t("ctaSignIn")}</Link>
        </Button>
      </div>

      <p
        className={`mt-8 text-xs text-muted-foreground font-mono transition-all duration-700 delay-500 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {t("microFooter")}
      </p>
    </div>
  );
}

/** Capabilities card displayed on the right side of the hero on desktop. */
function CapabilitiesCard({ t, visible }: { t: (key: string) => string; visible: boolean }) {
  const capabilities = [
    { icon: ListChecks, key: "tasks" },
    { icon: CalendarDays, key: "timeline" },
    { icon: Users, key: "team" },
    { icon: GitMerge, key: "dependencies" },
    { icon: Route, key: "scheduling" },
  ] as const;

  return (
    <div
      className={`h-full flex items-center transition-all duration-1000 delay-200 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="w-full rounded-2xl border border-foreground/10 bg-card/60 backdrop-blur-sm p-7 shadow-lg">
        <div className="text-xs font-mono text-muted-foreground mb-6 uppercase tracking-widest">
          {t("capabilities.label")}
        </div>
        <div className="space-y-5">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div key={cap.key} className="flex items-center gap-4 group">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary/15 transition-colors">
                  <Icon className="size-4" />
                </div>
                <span className="text-sm font-medium">{t(`capabilities.items.${cap.key}`)}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-foreground/8">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("capabilities.footer")}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("landing.hero");
  const words = useTranslations("landing.hero.animatedWords");
  const [visible, setVisible] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setWordIdx((p) => (p + 1) % WORD_KEYS.length), 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">
      <AnimatedGrid />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
        {/* Eyebrow */}
        <div
          className={`mb-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="w-6 h-px bg-foreground/40" />
            {t("eyebrow")}
          </span>
        </div>

        {/* Desktop: side-by-side heading + capabilities */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16">
          <HeroHeadingContent t={t} words={words} wordIdx={wordIdx} visible={visible} />
          <CapabilitiesCard t={t} visible={visible} />
        </div>

        {/* Mobile: stacked column */}
        <div className="flex flex-col gap-12 lg:hidden">
          <HeroHeadingContent t={t} words={words} wordIdx={wordIdx} visible={visible} />
          <CapabilitiesCard t={t} visible={visible} />
        </div>
      </div>
    </section>
  );
}
