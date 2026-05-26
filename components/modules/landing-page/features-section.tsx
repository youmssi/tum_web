"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  GitMerge,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";

const features = [
  {
    number: "01",
    icon: CalendarDays,
    title: "Visual Timeline",
    description:
      "Drag-and-drop scheduling with dependency arrows, milestone markers, and per-task progress bars. See your whole project at a glance — no spreadsheet required.",
  },
  {
    number: "02",
    icon: LayoutDashboard,
    title: "Instant Visibility",
    description:
      "Real-time dashboards with completion trends, status breakdowns, and overdue counters. Know what's on track and what needs attention — without a status meeting.",
  },
  {
    number: "03",
    icon: GitMerge,
    title: "Task Dependencies",
    description:
      "Link tasks so nothing starts before it should. Model sequential steps, parallel tracks, and milestones — Tûm keeps your plan coherent as things shift.",
  },
  {
    number: "04",
    icon: MessageSquare,
    title: "@Mention & Threads",
    description:
      "Loop teammates in directly on tasks. In-app notifications mean nothing falls through the cracks — whether your team is in operations, HR, marketing, or anything else.",
  },
  {
    number: "05",
    icon: Users,
    title: "Built for Every Team",
    description:
      "Operations, marketing, events, personal projects, community initiatives — if you have a project and a team, Tûm fits. No technical background required.",
  },
  {
    number: "06",
    icon: ShieldCheck,
    title: "Self-host or Cloud",
    description:
      "Run Tûm on your own server for free, or use Tûm Cloud for zero-ops convenience. Fair-code license — free for internal use, no vendor lock-in.",
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
            One workspace.
            <br />
            <span className="text-muted-foreground">Every kind of project.</span>
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
