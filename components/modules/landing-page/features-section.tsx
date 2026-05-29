"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CalendarDays,
  GitMerge,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

type FeatureKey = "timeline" | "visibility" | "dependencies" | "mentions" | "team" | "selfHost";

const FEATURE_ORDER: { key: FeatureKey; number: string; icon: LucideIcon }[] = [
  { key: "timeline", number: "01", icon: CalendarDays },
  { key: "visibility", number: "02", icon: LayoutDashboard },
  { key: "dependencies", number: "03", icon: GitMerge },
  { key: "mentions", number: "04", icon: MessageSquare },
  { key: "team", number: "05", icon: Users },
  { key: "selfHost", number: "06", icon: ShieldCheck },
];

function FeatureCard({
  number,
  icon: Icon,
  title,
  description,
  index,
}: {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}) {
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
    <div
      ref={ref}
      className={`group flex flex-col gap-4 p-6 rounded-2xl border border-foreground/8 hover:border-foreground/20 bg-card/50 hover:bg-card transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <span className="font-mono text-xs text-muted-foreground">{number}</span>
      </div>
      <div>
        <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const t = useTranslations("landing.features");
  const items = useTranslations("landing.features.items");
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
      id="features"
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURE_ORDER.map((f, i) => (
            <FeatureCard
              key={f.key}
              number={f.number}
              icon={f.icon}
              title={items(`${f.key}.title`)}
              description={items(`${f.key}.description`)}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
