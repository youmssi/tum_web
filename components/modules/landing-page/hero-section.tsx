"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, BarChart2, CalendarDays, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

// Animated word stays English-only — these are short visual fragments tied to the typing animation;
// localizing them properly is part of the Phase 10 full-localization epic.
const words = ["execute", "deliver", "track", "succeed"];

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

function GanttPreview() {
  return (
    <div className="relative rounded-2xl border border-foreground/10 bg-card shadow-2xl overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-foreground/10 bg-muted/30">
        <div className="size-3 rounded-full bg-foreground/20" />
        <div className="size-3 rounded-full bg-foreground/20" />
        <div className="size-3 rounded-full bg-foreground/20" />
        <span className="ml-2 text-xs text-muted-foreground font-mono">Tûm — Project Timeline</span>
      </div>
      {/* Gantt mockup */}
      <div className="p-4 space-y-2">
        {[
          { label: "Campaign brief", pct: 80, color: "bg-green-500", days: "May 1–12" },
          { label: "Asset delivery", pct: 55, color: "bg-blue-500", days: "May 8–20" },
          { label: "Stakeholder review", pct: 30, color: "bg-amber-500", days: "May 15–28" },
          { label: "Launch & measure", pct: 10, color: "bg-purple-500", days: "May 25–Jun 5" },
        ].map((row, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-28 text-xs text-muted-foreground truncate shrink-0">
              {row.label}
            </span>
            <div className="flex-1 h-6 rounded bg-muted relative overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full rounded ${row.color} opacity-80 transition-all`}
                style={{ width: `${row.pct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono w-24 text-right shrink-0">
              {row.days}
            </span>
          </div>
        ))}
        {/* Stats row */}
        <div className="mt-4 pt-4 border-t border-foreground/10 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-green-500" />4 tasks on track
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            Sprint 3 / Week 2
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart2 className="size-3.5 text-blue-500" />
            44% complete
          </span>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("landing.hero");
  const [visible, setVisible] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setWordIdx((p) => (p + 1) % words.length), 2800);
    return () => clearInterval(t);
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

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: headline + CTA */}
          <div>
            <h1
              className={`text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 transition-all duration-1000 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Project execution
              <br />
              built for teams to{" "}
              <span className="relative inline-block text-primary">
                <span key={wordIdx} className="inline-flex">
                  {words[wordIdx].split("").map((ch, i) => (
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

            {/* Social proof / positioning */}
            <p
              className={`mt-8 text-xs text-muted-foreground font-mono transition-all duration-700 delay-500 ${
                visible ? "opacity-100" : "opacity-0"
              }`}
            >
              {t("microFooter")}
            </p>
          </div>

          {/* Right: product preview */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <GanttPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
