/**
 * Gantt export — visual XLSX.
 *
 * Sheet 1 "Gantt":  visual chart — colored bars spanning date columns,
 *                   month/week timeline header, subtask indentation,
 *                   status colour coding, milestone markers, frozen panes.
 * Sheet 2 "Data":   flat re-importable table (identical to import template).
 */
import type { Task } from "@/components/modules/tasks";
import type { Dependency } from "./dependency-api";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const STATUS_ARGB: Record<string, string> = {
  DONE: "FF22C55E",
  IN_PROGRESS: "FF3B82F6",
  IN_REVIEW: "FFF59E0B",
  TODO: "FF64748B",
};

// One distinct dark shade per calendar month for the month-header cells
const MONTH_ARGB = [
  "FF1E3A5F",
  "FF1B4F72",
  "FF1A5276",
  "FF148F77",
  "FF1E8449",
  "FF1A7A3C",
  "FF7D6608",
  "FFB7770D",
  "FF935116",
  "FF6C3483",
  "FF2C3E50",
  "FF1C2833",
];

type Granularity = "day" | "week" | "month";

function isoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export async function exportGanttXlsx(
  tasks: Task[],
  allDeps: Dependency[],
  projectName = "project",
): Promise<void> {
  const { Workbook } = await import("exceljs");
  const wb = new Workbook();
  wb.creator = "Tûm";
  wb.created = new Date();

  // ── Shared helpers ──────────────────────────────────────────────────────
  function solidFill(argb: string) {
    return { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb } };
  }
  function hairBorderBottom() {
    return { bottom: { style: "hair" as const, color: { argb: "FFE2E8F0" } } };
  }

  // ── Sheet 1: Visual Gantt ───────────────────────────────────────────────
  const ws = wb.addWorksheet("Gantt");

  const scheduled = tasks.filter((t) => t.startDate && t.endDate);

  if (scheduled.length > 0) {
    const minMs = Math.min(...scheduled.map((t) => +new Date(t.startDate!)));
    const maxMs = Math.max(...scheduled.map((t) => +new Date(t.endDate!)));
    const daySpan = Math.round((maxMs - minMs) / 86_400_000) + 1;

    const gran: Granularity = daySpan > 180 ? "month" : daySpan > 60 ? "week" : "day";

    // Generate date-column anchor dates
    const dateCols: Date[] = [];
    if (gran === "day") {
      for (let d = new Date(minMs); d.getTime() <= maxMs; d.setDate(d.getDate() + 1))
        dateCols.push(new Date(d));
    } else if (gran === "week") {
      const start = new Date(minMs);
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday
      for (let d = new Date(start); d.getTime() <= maxMs; d.setDate(d.getDate() + 7))
        dateCols.push(new Date(d));
    } else {
      const start = new Date(new Date(minMs).getFullYear(), new Date(minMs).getMonth(), 1);
      const end = new Date(new Date(maxMs).getFullYear(), new Date(maxMs).getMonth() + 1, 0);
      for (let d = new Date(start); d.getTime() <= end.getTime(); d.setMonth(d.getMonth() + 1))
        dateCols.push(new Date(d));
    }

    const INFO = 7; // columns A–G are task info

    // Column widths
    ws.getColumn(1).width = 4; // #
    ws.getColumn(2).width = 28; // Title
    ws.getColumn(3).width = 13; // Status
    ws.getColumn(4).width = 9; // Priority
    ws.getColumn(5).width = 11; // Start
    ws.getColumn(6).width = 11; // End
    ws.getColumn(7).width = 7; // %

    const dcWidth = gran === "day" ? 3.2 : gran === "week" ? 5 : 9;
    dateCols.forEach((_, i) => {
      ws.getColumn(INFO + 1 + i).width = dcWidth;
    });

    ws.views = [{ state: "frozen", xSplit: INFO, ySplit: 2 }];

    // ── Row 1: info-column headers + month labels ───────────────────────
    const r1 = ws.getRow(1);
    r1.height = 20;

    const DARK = "FF0F172A";
    const MID = "FF1E293B";

    ["#", "Task Title", "Status", "Priority", "Start", "End", "%"].forEach((label, i) => {
      const c = r1.getCell(i + 1);
      c.value = label;
      c.fill = solidFill(DARK);
      c.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };
      c.alignment = { horizontal: i === 1 ? "left" : "center", vertical: "middle" };
      c.border = { bottom: { style: "thin", color: { argb: MID } } };
    });

    // Group date columns by "Mon YYYY" and merge
    type MGroup = { label: string; argb: string; start: number; end: number };
    const mGroups: MGroup[] = [];
    dateCols.forEach((d, i) => {
      const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      const col = INFO + 1 + i;
      const last = mGroups[mGroups.length - 1];
      if (last && last.label === label) {
        last.end = col;
      } else mGroups.push({ label, argb: MONTH_ARGB[d.getMonth()], start: col, end: col });
    });

    mGroups.forEach((g) => {
      if (g.start < g.end) ws.mergeCells(1, g.start, 1, g.end);
      const c = r1.getCell(g.start);
      c.value = g.label;
      c.fill = solidFill(g.argb);
      c.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };
      c.alignment = { horizontal: "center", vertical: "middle" };
    });

    // ── Row 2: day/week sub-labels ─────────────────────────────────────
    const r2 = ws.getRow(2);
    r2.height = 15;

    for (let i = 1; i <= INFO; i++) {
      const c = r2.getCell(i);
      c.fill = solidFill(MID);
      c.border = { bottom: { style: "thin", color: { argb: "FF334155" } } };
    }

    const todayStr = isoDate(new Date());

    dateCols.forEach((d, i) => {
      const col = INFO + 1 + i;
      const c = r2.getCell(col);

      let label: string | number;
      if (gran === "day") label = d.getDate();
      else if (gran === "week") label = `${d.getDate()}/${d.getMonth() + 1}`;
      else label = MONTH_NAMES[d.getMonth()];

      c.value = label;
      c.fill = solidFill(gran === "day" && isoDate(d) === todayStr ? "FF0EA5E9" : MID);
      c.font = { color: { argb: "FFCBD5E1" }, size: 7 };
      c.alignment = { horizontal: "center", vertical: "middle" };

      const border: Record<string, { style: "thin" | "hair"; color: { argb: string } }> = {
        bottom: { style: "thin", color: { argb: "FF334155" } },
      };
      const nextD = dateCols[i + 1];
      if (nextD && nextD.getMonth() !== d.getMonth()) {
        border.right = { style: "thin", color: { argb: "FF475569" } };
      }
      c.border = border;
    });

    // ── Task rows ───────────────────────────────────────────────────────
    const ODD = "FFF8FAFC";
    const EVEN = "FFFFFFFF";

    tasks.forEach((task, idx) => {
      const rowIdx = 3 + idx;
      const row = ws.getRow(rowIdx);
      row.height = 16;
      const bg = idx % 2 === 0 ? ODD : EVEN;
      const isSubtask = !!task.parentTaskId;
      const barArgb = STATUS_ARGB[task.status] ?? "FF64748B";

      // Info cells
      const num = row.getCell(1);
      num.value = idx + 1;
      num.fill = solidFill(bg);
      num.font = { size: 8, color: { argb: "FF94A3B8" } };
      num.alignment = { horizontal: "center", vertical: "middle" };
      num.border = hairBorderBottom();

      const title = row.getCell(2);
      title.value = task.title;
      title.fill = solidFill(bg);
      title.font = {
        size: 9,
        bold: !isSubtask,
        color: { argb: isSubtask ? "FF64748B" : "FF0F172A" },
      };
      title.alignment = { horizontal: "left", vertical: "middle", indent: isSubtask ? 2 : 0 };
      title.border = hairBorderBottom();

      const status = row.getCell(3);
      status.value = task.status;
      status.fill = solidFill(bg);
      status.font = { size: 8, color: { argb: STATUS_ARGB[task.status] ?? "FF64748B" } };
      status.alignment = { horizontal: "center", vertical: "middle" };
      status.border = hairBorderBottom();

      const priority = row.getCell(4);
      priority.value = task.priority;
      priority.fill = solidFill(bg);
      priority.font = { size: 8 };
      priority.alignment = { horizontal: "center", vertical: "middle" };
      priority.border = hairBorderBottom();

      const startC = row.getCell(5);
      startC.value = task.startDate ?? "—";
      startC.fill = solidFill(bg);
      startC.font = { size: 8 };
      startC.alignment = { horizontal: "center", vertical: "middle" };
      startC.border = hairBorderBottom();

      const endC = row.getCell(6);
      endC.value = task.endDate ?? "—";
      endC.fill = solidFill(bg);
      endC.font = { size: 8 };
      endC.alignment = { horizontal: "center", vertical: "middle" };
      endC.border = hairBorderBottom();

      const pct = row.getCell(7);
      pct.value = `${task.progress}%`;
      pct.fill = solidFill(bg);
      pct.font = { size: 8 };
      pct.alignment = { horizontal: "center", vertical: "middle" };
      pct.border = hairBorderBottom();

      // Bar cells
      const taskStartMs = task.startDate ? +new Date(task.startDate) : null;
      const taskEndMs = task.endDate ? +new Date(task.endDate) : null;

      dateCols.forEach((d, i) => {
        const col = INFO + 1 + i;
        const bc = row.getCell(col);
        bc.alignment = { horizontal: "center", vertical: "middle" };

        const colStartMs = d.getTime();
        let colEndMs: number;
        if (gran === "day") {
          colEndMs = colStartMs + 86_400_000 - 1;
        } else if (gran === "week") {
          colEndMs = colStartMs + 7 * 86_400_000 - 1;
        } else {
          colEndMs = new Date(d.getFullYear(), d.getMonth() + 1, 0).getTime() + 86_400_000 - 1;
        }

        const inRange =
          taskStartMs !== null &&
          taskEndMs !== null &&
          taskStartMs <= colEndMs &&
          taskEndMs >= colStartMs;

        const isToday = gran === "day" && isoDate(d) === todayStr;

        if (inRange) {
          bc.fill = solidFill(barArgb);
          if (task.milestone && taskStartMs === colStartMs) {
            bc.value = "◆";
            bc.font = { color: { argb: "FFFFFFFF" }, size: 7 };
          }
        } else {
          bc.fill = solidFill(isToday ? "FFF0F9FF" : bg);
        }

        // Border: month boundary or today marker
        const border: Record<
          string,
          { style: "thin" | "hair" | "medium"; color: { argb: string } }
        > = {
          bottom: { style: "hair", color: { argb: "FFE2E8F0" } },
        };
        const nextD = dateCols[i + 1];
        if (nextD && nextD.getMonth() !== d.getMonth()) {
          border.right = { style: "thin", color: { argb: "FFE2E8F0" } };
        }
        if (isToday) {
          border.left = { style: "medium", color: { argb: "FF0EA5E9" } };
          border.right = { style: "medium", color: { argb: "FF0EA5E9" } };
        }
        bc.border = border;
      });
    });
  } else {
    // No scheduled tasks — write a notice in A1
    ws.getRow(1).getCell(1).value =
      "No tasks with start/end dates found. See the 'Data' sheet for all task data.";
    ws.getRow(1).getCell(1).font = { italic: true, color: { argb: "FF64748B" } };
    ws.getColumn(1).width = 60;
  }

  // ── Sheet 2: Re-importable data ─────────────────────────────────────────
  const ws2 = wb.addWorksheet("Data");

  const titleById = new Map(tasks.map((t) => [t.id, t.title]));
  const depsTo = new Map<string, string[]>();
  for (const dep of allDeps) {
    const list = depsTo.get(dep.toTaskId) ?? [];
    list.push(dep.fromTaskId);
    depsTo.set(dep.toTaskId, list);
  }

  const dataHeaders = [
    "project_name",
    "project_description",
    "title",
    "description",
    "parent_task",
    "start_date",
    "end_date",
    "status",
    "priority",
    "progress",
    "milestone",
    "depends_on",
  ];
  const hRow = ws2.addRow(dataHeaders);
  hRow.height = 20;
  hRow.eachCell((c) => {
    c.fill = solidFill("FF0F172A");
    c.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    c.alignment = { horizontal: "left", vertical: "middle" };
  });

  tasks.forEach((task, idx) => {
    const parentTitle = task.parentTaskId ? (titleById.get(task.parentTaskId) ?? "") : "";
    const depTitles = (depsTo.get(task.id) ?? [])
      .map((id) => titleById.get(id) ?? "")
      .filter(Boolean)
      .join(",");
    ws2.addRow([
      idx === 0 ? projectName : "",
      "",
      task.title,
      task.description ?? "",
      parentTitle,
      task.startDate ?? "",
      task.endDate ?? "",
      task.status,
      task.priority,
      task.progress,
      task.milestone ? "TRUE" : "FALSE",
      depTitles,
    ]);
  });
  ws2.columns = [20, 24, 36, 36, 30, 12, 12, 14, 10, 10, 10, 30].map((width) => ({ width }));

  // ── Browser download ────────────────────────────────────────────────────
  const safe =
    projectName
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "project";
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safe}-gantt.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
