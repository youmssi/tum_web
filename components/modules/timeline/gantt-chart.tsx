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
 * The chart is fully recreated only when {@link viewMode} changes. Task data
 * changes flow through the instance `refresh()` API, which keeps scroll position
 * and avoids the teardown flicker — so a background refetch, or selecting a bar
 * in link mode, no longer resets the chart mid-interaction. Callbacks and options
 * are read from a ref so their identity never forces a recreate.
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

  // Latest props read by the (stable) Gantt callbacks and by recreate, without re-triggering it.
  const latest = useRef({ tasks, options, onClick, onDateChange, onProgressChange });

  // Sync the ref after every render (writing a ref during render is disallowed). Declared before
  // the create/refresh effects so it runs first on each commit, keeping their reads current.
  useEffect(() => {
    latest.current = { tasks, options, onClick, onDateChange, onProgressChange };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;

    void (async () => {
      const { default: Gantt } = await import("frappe-gantt");
      if (disposed || !containerRef.current) return;
      container.innerHTML = "";
      ganttRef.current = new Gantt(container, latest.current.tasks, {
        view_mode: viewMode,
        on_click: (task) => latest.current.onClick?.(task),
        on_date_change: (task, start, end) => latest.current.onDateChange?.(task, start, end),
        on_progress_change: (task, progress) => latest.current.onProgressChange?.(task, progress),
        ...latest.current.options,
      });
    })();

    return () => {
      disposed = true;
      ganttRef.current = null;
      container.innerHTML = "";
    };
  }, [viewMode]);

  // In-place data update — preserves scroll/interaction state. On mount the instance isn't ready
  // yet (async import), so this no-ops and the create effect renders the initial tasks.
  useEffect(() => {
    ganttRef.current?.refresh(tasks);
  }, [tasks]);

  return <div ref={containerRef} className={className} />;
}
