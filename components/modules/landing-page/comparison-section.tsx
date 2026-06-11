"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckIcon, MinusIcon } from "lucide-react";

const COMPARISON_ROWS = [
  { key: "gantt", tum: true, linear: false, asana: true, jira: true },
  { key: "dependencyScheduling", tum: true, linear: false, asana: false, jira: true },
  { key: "criticalPath", tum: true, linear: false, asana: false, jira: false },
  { key: "customFields", tum: true, linear: true, asana: true, jira: true },
  { key: "customStatuses", tum: true, linear: true, asana: true, jira: true },
  { key: "workloadView", tum: true, linear: true, asana: true, jira: false },
  { key: "selfHost", tum: true, linear: false, asana: false, jira: true },
  { key: "fairCode", tum: true, linear: false, asana: false, jira: false },
  { key: "unlimitedUsers", tum: true, linear: false, asana: false, jira: false },
  { key: "realTime", tum: true, linear: true, asana: true, jira: true },
  { key: "openSource", tum: true, linear: false, asana: false, jira: false },
] as const;

const COLUMNS = [
  { key: "tum", label: "Tûm", highlight: true },
  { key: "linear", label: "Linear", highlight: false },
  { key: "asana", label: "Asana", highlight: false },
  { key: "jira", label: "Jira", highlight: false },
];

function CellIcon({ value }: { value: boolean }) {
  if (value) {
    return <CheckIcon className="size-4 text-green-500" />;
  }
  return <MinusIcon className="size-4 text-muted-foreground/40" />;
}

export function ComparisonSection() {
  const t = useTranslations("landing.comparison");
  const rows = useTranslations("landing.comparison.rows");
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
    <section ref={ref} className="relative py-24 lg:py-28 border-t border-foreground/8">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div
          className={`mb-12 text-center transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
            <span className="w-6 h-px bg-foreground/40" />
            {t("sectionLabel")}
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-3">{t("heading")}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("subhead")}</p>
        </div>

        <div
          className={`overflow-x-auto transition-all duration-700 delay-200 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-foreground/10">
                <th className="text-left py-4 pr-6 text-muted-foreground font-medium w-48">
                  {t("headerFeature")}
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`py-4 px-4 text-center font-semibold ${
                      col.highlight ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.key}
                  className={`border-b border-foreground/5 transition-colors hover:bg-muted/20 ${
                    i % 2 === 0 ? "bg-muted/10" : ""
                  }`}
                >
                  <td className="py-3 pr-6 text-muted-foreground">{rows(row.key)}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <CellIcon value={row.tum} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <CellIcon value={row.linear} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <CellIcon value={row.asana} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <CellIcon value={row.jira} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p
          className={`text-center text-xs text-muted-foreground/60 mt-8 transition-all duration-700 delay-500 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {t("footer")}
        </p>
      </div>
    </section>
  );
}
