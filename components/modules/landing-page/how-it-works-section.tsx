"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type StepKey = "signup" | "organise" | "timeline" | "track";

const STEPS: { key: StepKey; number: string }[] = [
  { key: "signup", number: "01" },
  { key: "organise", number: "02" },
  { key: "timeline", number: "03" },
  { key: "track", number: "04" },
];

export function HowItWorksSection() {
  const t = useTranslations("landing.howItWorks");
  const steps = useTranslations("landing.howItWorks.steps");
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative py-24 lg:py-32 border-t border-foreground/8"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-20">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
            <span className="w-6 h-px bg-foreground/40" />
            {t("sectionLabel")}
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-bold tracking-tight transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {t("heading")}
            <br />
            <span className="text-muted-foreground">{t("headingAccent")}</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-7 top-10 bottom-10 w-px bg-foreground/10 hidden lg:block" />

          <div className="space-y-0 divide-y divide-foreground/8">
            {STEPS.map((step, i) => (
              <div
                key={step.key}
                className={`flex gap-8 lg:gap-16 py-10 lg:py-14 transition-all duration-700 ${
                  visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="relative shrink-0">
                  <div className="size-14 rounded-full border-2 border-foreground/15 flex items-center justify-center bg-background z-10 relative">
                    <span className="font-mono text-sm font-semibold text-muted-foreground">
                      {step.number}
                    </span>
                  </div>
                </div>
                <div className="pt-3">
                  <h3 className="text-xl lg:text-2xl font-semibold mb-3">
                    {steps(`${step.key}.title`)}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xl">
                    {steps(`${step.key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
