import { describe, expect, it } from "vitest";

import { type GanttExportInput, buildGanttSvg, taskHealth } from "./gantt-export";

const base: GanttExportInput = {
  title: "Apollo launch",
  subtitle: "Acme",
  stamp: "Exported on 15 Nov 2026",
  footer: "Made with Tûm · tum.mrvin100.de",
  tasks: [
    {
      id: "a",
      name: "Design",
      start: "2026-11-02",
      end: "2026-11-06",
      progress: 50,
      milestone: false,
      health: "onTrack",
    },
    {
      id: "b",
      name: "Build <API> & UI",
      start: "2026-11-09",
      end: "2026-11-20",
      progress: 0,
      milestone: false,
      health: "nearDue",
    },
    {
      id: "c",
      name: "Go live",
      start: "2026-11-23",
      end: "2026-11-23",
      progress: 0,
      milestone: true,
      health: "overdue",
    },
  ],
  dependencies: [
    { from: "a", to: "b" },
    { from: "b", to: "c" },
  ],
  colors: { onTrack: "#3b82f6", nearDue: "#f97316", overdue: "#ef4444", done: "#16a34a" },
  labels: {
    task: "Task",
    start: "Start",
    end: "End",
    progress: "%",
    today: "Today",
    critical: "Critical path",
    legend: { onTrack: "On track", nearDue: "Near due", overdue: "Overdue", done: "Done" },
  },
  scale: "Week",
  locale: "en",
  today: "2026-11-15",
};

function count(svg: string, fragment: string) {
  return svg.split(fragment).length - 1;
}

describe("buildGanttSvg", () => {
  it("produces a standalone SVG with the title, stamp and every task", () => {
    const { svg, width, height } = buildGanttSvg(base);

    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg).toContain(`viewBox="0 0 ${width} ${height}"`);
    expect(svg).toContain("Apollo launch");
    expect(svg).toContain("Exported on 15 Nov 2026");
    expect(svg).toContain(">Design<");
    expect(svg).toContain(">50%<");
  });

  it("escapes task names so they cannot break the document", () => {
    const { svg } = buildGanttSvg(base);

    expect(svg).toContain("Build &lt;API&gt; &amp; UI");
    expect(svg).not.toContain("<API>");
  });

  it("draws milestones as diamonds and other tasks as bars with their progress", () => {
    const { svg } = buildGanttSvg(base);

    expect(count(svg, "<polygon points=")).toBe(1 + base.dependencies.length);
    expect(svg).toContain('fill="#ef4444"/>');
    expect(count(svg, 'fill-opacity="0.35"')).toBe(2);
  });

  it("draws one arrow per dependency between tasks that are in the export", () => {
    const withStray = { ...base, dependencies: [...base.dependencies, { from: "a", to: "zzz" }] };
    const { svg } = buildGanttSvg(withStray);

    expect(count(svg, '<path d="M')).toBe(2);
  });

  it("outlines critical tasks and adds the critical path to the legend only when there are some", () => {
    expect(buildGanttSvg(base).svg).not.toContain("Critical path");

    const critical = {
      ...base,
      tasks: base.tasks.map((t) => ({ ...t, critical: t.id !== "a" })),
    };
    const { svg } = buildGanttSvg(critical);

    expect(svg).toContain("Critical path");
    expect(count(svg, 'stroke="#dc2626" stroke-width="2"')).toBe(3);
  });

  it("marks today only when it falls within the schedule", () => {
    expect(buildGanttSvg(base).svg).toContain(">Today<");
    expect(buildGanttSvg({ ...base, today: "2027-06-01" }).svg).not.toContain(">Today<");
  });

  it("adds the footer only when one is given", () => {
    expect(buildGanttSvg(base).svg).toContain("Made with Tûm");
    const { svg, height } = buildGanttSvg({ ...base, footer: undefined });
    expect(svg).not.toContain("Made with Tûm");
    expect(height).toBeLessThan(buildGanttSvg(base).height);
  });

  it("routes an arrow around the bars when the successor starts before its predecessor ends", () => {
    const overlap = {
      ...base,
      tasks: [base.tasks[0], { ...base.tasks[1], start: "2026-11-04" }],
      dependencies: [{ from: "a", to: "b" }],
    };
    const path = buildGanttSvg(overlap).svg.match(/<path d="([^"]+)"/)?.[1] ?? "";

    expect(path.match(/[HV]/g)).toHaveLength(5);
  });

  it("shows the year in dates only when the schedule spans more than one year", () => {
    expect(buildGanttSvg(base).svg).toContain(">Nov 2<");
    const crossing = {
      ...base,
      tasks: [...base.tasks, { ...base.tasks[0], id: "d", start: "2027-01-04", end: "2027-01-08" }],
    };
    expect(buildGanttSvg(crossing).svg).toContain(">Nov 2, 2026<");
  });

  it("is wider at a finer scale", () => {
    const day = buildGanttSvg({ ...base, scale: "Day" }).width;
    const week = buildGanttSvg(base).width;
    const month = buildGanttSvg({ ...base, scale: "Month" }).width;

    expect(day).toBeGreaterThan(week);
    expect(week).toBeGreaterThan(month);
  });

  it("still renders an empty schedule", () => {
    const { svg } = buildGanttSvg({ ...base, tasks: [], dependencies: [] });

    expect(svg).toContain("Apollo launch");
    expect(svg).toContain("</svg>");
  });
});

describe("taskHealth", () => {
  const now = Date.UTC(2026, 10, 15);

  it("reports done tasks as done whatever their date", () => {
    expect(taskHealth({ status: "DONE", endDate: "2026-11-01" }, 3, now)).toBe("done");
  });

  it("reports overdue, near due and on track by end date", () => {
    expect(taskHealth({ status: "TODO", endDate: "2026-11-10" }, 3, now)).toBe("overdue");
    expect(taskHealth({ status: "TODO", endDate: "2026-11-16" }, 3, now)).toBe("nearDue");
    expect(taskHealth({ status: "TODO", endDate: "2026-12-01" }, 3, now)).toBe("onTrack");
    expect(taskHealth({ status: "TODO", endDate: null }, 3, now)).toBe("onTrack");
  });
});
