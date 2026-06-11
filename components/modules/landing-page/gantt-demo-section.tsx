"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { InteractiveGanttDemo } from "./interactive-gantt-demo";

export function GanttDemoSection() {
  const t = useTranslations("landing.ganttDemo");
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="demo"
      ref={ref}
      className="relative py-24 lg:py-32 border-t border-foreground/8 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-14 lg:mb-20 text-center">
          <span
            className={`inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="w-6 h-px bg-foreground/40" />
            {t("sectionLabel")}
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-bold tracking-tight transition-all duration-700 delay-100 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {t("heading")}
            <br />
            <span className="text-muted-foreground">{t("headingAccent")}</span>
          </h2>
          <p
            className={`text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mt-4 transition-all duration-700 delay-200 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {t("subhead")}
          </p>
        </div>

        {/* Full-width Gantt demo */}
        <div
          className={`max-w-5xl mx-auto transition-all duration-1000 delay-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <InteractiveGanttDemo />
        </div>
      </div>
    </section>
  );
}
