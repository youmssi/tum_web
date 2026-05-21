"use client";

import { useEffect, useRef } from "react";

import type GanttInstance from "frappe-gantt";
import type { GanttOptions, GanttTask, GanttViewMode } from "frappe-gantt";

// Vendored stylesheet (see ./frappe-gantt.css) — themeable to our design tokens.
import "./frappe-gantt.css";

export type { GanttOptions, GanttTask, GanttViewMode };

export interface GanttChartProps {
  tasks: GanttTask[];
  viewMode?: GanttViewMode;
  /** Escape hatch for any Frappe Gantt option not surfaced as a prop. */
  options?: GanttOptions;
  className?: string;
  onClick?: GanttOptions["on_click"];
  onDateChange?: GanttOptions["on_date_change"];
  onProgressChange?: GanttOptions["on_progress_change"];
}

/**
 * Base React wrapper around Frappe Gantt (vanilla-JS, SVG renderer).
 *
 * This is the single integration point for the Gantt/timeline engine: the rest
 * of the app depends on THIS component, never on `frappe-gantt` directly, so the
 * engine can be themed or swapped without wider changes. The library is loaded
 * client-side only because it manipulates the DOM/SVG on construction.
 *
 * For now it re-creates the chart when inputs change; once the timeline feature
 * (TUM-E06) firms up, switch to the instance `refresh()`/`update_task()` APIs
 * (already typed in `types/frappe-gantt.d.ts`) for cheaper updates.
 */
export function GanttChart({
  tasks,
  viewMode = "Week",
  options,
  className,
  onClick,
  onDateChange,
  onProgressChange,
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<GanttInstance | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;

    void (async () => {
      const { default: Gantt } = await import("frappe-gantt");
      if (disposed || !containerRef.current) return;
      container.innerHTML = "";
      ganttRef.current = new Gantt(container, tasks, {
        view_mode: viewMode,
        on_click: onClick,
        on_date_change: onDateChange,
        on_progress_change: onProgressChange,
        ...options,
      });
    })();

    return () => {
      disposed = true;
      ganttRef.current = null;
      container.innerHTML = "";
    };
  }, [tasks, viewMode, options, onClick, onDateChange, onProgressChange]);

  return <div ref={containerRef} className={className} />;
}
