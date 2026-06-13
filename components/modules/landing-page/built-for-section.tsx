"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  BrushIcon,
  Code2Icon,
  MegaphoneIcon,
  Building2Icon,
  CalendarCheck2Icon,
  FlaskConicalIcon,
  HandHeartIcon,
  type LucideIcon,
} from "lucide-react";

type TeamKey =
  | "engineering"
  | "marketing"
  | "operations"
  | "events"
  | "research"
  | "community"
  | "design";

const TEAMS: { key: TeamKey; icon: LucideIcon; color: string }[] = [
  { key: "engineering", icon: Code2Icon, color: "text-blue-500" },
  { key: "marketing", icon: MegaphoneIcon, color: "text-pink-500" },
  { key: "operations", icon: Building2Icon, color: "text-amber-500" },
  { key: "events", icon: CalendarCheck2Icon, color: "text-green-500" },
  { key: "research", icon: FlaskConicalIcon, color: "text-purple-500" },
  { key: "community", icon: HandHeartIcon, color: "text-rose-500" },
  { key: "design", icon: BrushIcon, color: "text-cyan-500" },
];

export function BuiltForSection() {
  const t = useTranslations("landing.builtFor");
  const teams = useTranslations("landing.builtFor.teams");
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-16 lg:py-20 border-t border-foreground/8 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div
          className={`text-center mb-10 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
            <span className="w-6 h-px bg-foreground/40" />
            {t("sectionLabel")}
          </span>
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">{t("heading")}</h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">{t("subhead")}</p>
        </div>

        {/* Wrapped trust bar — flex-wrap avoids horizontal scrollbar on small screens */}
        <div className="flex flex-wrap justify-center items-center gap-3">
          {TEAMS.map((team, i) => {
            const Icon = team.icon;
            return (
              <div
                key={team.key}
                className={`flex items-center gap-3 rounded-full border border-foreground/10 px-5 py-3 bg-card/50 hover:bg-card hover:border-foreground/20 transition-all duration-500 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <Icon className={`size-5 ${team.color}`} />
                <span className="text-sm font-medium whitespace-nowrap">
                  {teams(`${team.key}.label`)}
                </span>
              </div>
            );
          })}
        </div>

        <p
          className={`text-center text-xs text-muted-foreground/60 mt-4 transition-all duration-700 delay-500 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {t("footer")}
        </p>
      </div>
    </section>
  );
}
