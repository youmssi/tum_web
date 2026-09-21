"use client";

import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

import { GanttChart, type GanttTask } from "@/components/modules/timeline";

/** Shift a Date by `days` (positive = future, negative = past). */
function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

/**
 * Build demo tasks whose bars are always centred around today so the chart
 * looks correct no matter when a visitor loads the page.
 *
 * Layout (relative to today):
 *  1. Market research  — completed  −28 → −15 days ago
 *  2. Campaign brief   — completed  −21 → −8  days ago
 *  3. Asset creation   — active       −7 → +9 days  (spans TODAY)
 *  4. Internal review  — active       +3 → +17 days
 *  5. Launch prep      — upcoming    +10 → +22 days
 *  6. Go / no-go       — milestone   +22 → +22 days
 */
function buildDemoTasks(): GanttTask[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [
    {
      id: "demo-1",
      name: "Market research",
      start: addDays(today, -28),
      end: addDays(today, -15),
      progress: 100,
      dependencies: "",
      custom_class: "tum-demo-done",
    },
    {
      id: "demo-2",
      name: "Campaign brief",
      start: addDays(today, -21),
      end: addDays(today, -8),
      progress: 80,
      dependencies: "demo-1",
      custom_class: "tum-demo-done",
    },
    {
      id: "demo-3",
      name: "Asset creation",
      start: addDays(today, -7),
      end: addDays(today, 9),
      progress: 55,
      dependencies: "demo-2",
      custom_class: "tum-demo-active",
    },
    {
      id: "demo-4",
      name: "Internal review",
      start: addDays(today, 3),
      end: addDays(today, 17),
      progress: 25,
      dependencies: "demo-3",
      custom_class: "tum-demo-active",
    },
    {
      id: "demo-5",
      name: "Launch prep",
      start: addDays(today, 10),
      end: addDays(today, 22),
      progress: 10,
      dependencies: "demo-4",
      custom_class: "tum-demo-critical",
    },
    {
      id: "demo-6",
      name: "Go / no-go",
      start: addDays(today, 22),
      end: addDays(today, 22),
      progress: 0,
      dependencies: "demo-5",
      custom_class: "tum-demo-critical",
    },
  ];
}

export function InteractiveGanttDemo() {
  const throttleRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoTasks = useMemo(() => buildDemoTasks(), []);

  // Clean up the throttle timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleDemoInteraction() {
    if (throttleRef.current) {
      throttleRef.current = false;

      toast("Try the full Tûm Gantt for free", {
        description: "Drag bars, link dependencies, and schedule your real project in seconds.",
        duration: 5000,
        action: {
          label: "Sign up",
          onClick: () => {
            window.location.assign("/signup");
          },
        },
      });

      timerRef.current = setTimeout(() => {
        throttleRef.current = true;
      }, 10_000);
    }
  }

  return (
    <div className="relative rounded-2xl border border-foreground/10 bg-card shadow-2xl overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-foreground/10 bg-muted/30">
        <div className="size-3 rounded-full bg-red-400/60" />
        <div className="size-3 rounded-full bg-amber-400/60" />
        <div className="size-3 rounded-full bg-green-400/60" />
        <span className="ml-2 text-xs text-muted-foreground font-mono">Tûm — Project Timeline</span>
      </div>

      {/* Interactive Gantt chart — fixed height so Frappe Gantt's SVG has room to render */}
      <div className="demo-gantt-wrapper h-[260px] lg:h-[340px]">
        <GanttChart
          tasks={demoTasks}
          viewMode="Week"
          onDateChange={handleDemoInteraction}
          onProgressChange={handleDemoInteraction}
          options={{
            bar_height: 28,
            padding: 12,
            today_button: false,
            view_mode_select: false,
            popup_on: "hover",
          }}
        />
      </div>

      {/* Demo-specific styles */}
      <style>{`
        /* ---- Fix container sizing ---- */
        /* Remove height:auto override so Frappe Gantt's own --gv-grid-height applies */
        .demo-gantt-wrapper .gantt-container {
          overflow: auto;
          height: 100%;
          border: none;
          border-radius: 0;
        }

        /* Hide the toolbar side-header (view-mode select + today button — disabled via options anyway) */
        .demo-gantt-wrapper .gantt-container .side-header {
          display: none !important;
        }

        /* Keep grid-header sticky for scroll */
        .demo-gantt-wrapper .gantt-container .grid-header {
          position: sticky;
        }

        /* ---- Demo bar colours ---- */
        .demo-gantt-wrapper .gantt .tum-demo-done .bar {
          fill: #6366f1;
          stroke: #4f46e5;
        }
        .demo-gantt-wrapper .gantt .tum-demo-done .bar-progress {
          fill: #4f46e5;
        }

        .demo-gantt-wrapper .gantt .tum-demo-active .bar {
          fill: #f59e0b;
          stroke: #d97706;
        }
        .demo-gantt-wrapper .gantt .tum-demo-active .bar-progress {
          fill: #d97706;
        }

        .demo-gantt-wrapper .gantt .tum-demo-critical .bar {
          fill: #ef4444;
          stroke: #dc2626;
        }
        .demo-gantt-wrapper .gantt .tum-demo-critical .bar-progress {
          fill: #dc2626;
        }

        .demo-gantt-wrapper .gantt .arrow {
          stroke: var(--g-arrow-color, #64748b);
        }
      `}</style>
    </div>
  );
}
