"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  GitMerge,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";

const features = [
  {
    number: "01",
    icon: CalendarDays,
    title: "Visual Gantt Timeline",
    description:
      "Drag-and-drop scheduling with dependency arrows, milestone markers, and progress tracking. See the full picture at a glance.",
  },
  {
    number: "02",
    icon: LayoutDashboard,
    title: "Real-time Dashboards",
    description:
      "Completion trends, status breakdowns, overdue alerts — all calculated live. No manual reports, no stale spreadsheets.",
  },
  {
    number: "03",
    icon: GitMerge,
    title: "Task Dependencies",
    description:
      "Model finish-to-start, start-to-start, and cross-task links. Tûm keeps your critical path honest.",
  },
  {
    number: "04",
    icon: MessageSquare,
    title: "@Mention Notifications",
    description:
      "Loop in teammates directly in task comments. Instant in-app notifications so nothing falls through the cracks.",
  },
  {
    number: "05",
    icon: Zap,
    title: "Keyboard-first UX",
    description:
      "⌘K command palette for instant task search. Bulk status updates, quick filters — built for speed.",
  },
  {
    number: "06",
    icon: ShieldCheck,
    title: "Enterprise Ready",
    description:
      "Role-based access, audit logs, organisation switcher. Scales from a solo project to a 200-person engineering org.",
  },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
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

  const Icon = feature.icon;

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
        <span className="font-mono text-xs text-muted-foreground">{feature.number}</span>
      </div>
      <div>
        <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
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
            Capabilities
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-bold tracking-tight transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Everything you need
            <br />
            <span className="text-muted-foreground">to ship on time.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={f.number} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
