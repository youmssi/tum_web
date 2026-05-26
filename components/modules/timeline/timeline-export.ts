/**
 * Gantt export — XLSX only.
 *
 * Exports all project tasks in the same column layout as the import template,
 * enabling a clean round-trip: export → share / edit offline → re-import.
 *
 * Uses the already-installed `xlsx` (SheetJS, Apache 2.0) via dynamic import
 * so the ~1 MB bundle is only loaded when the user clicks Export.
 */
import type { Task } from "@/components/modules/tasks";
import type { Dependency } from "./dependency-api";

export async function exportGanttXlsx(
  tasks: Task[],
  allDeps: Dependency[],
  projectName = "project",
): Promise<void> {
  const xlsx = await import("xlsx");

  // Build lookup maps
  const titleById = new Map(tasks.map((t) => [t.id, t.title]));

  // depends_on: for each task, which task IDs point TO it (fromTaskId → toTaskId)
  const depsTo = new Map<string, string[]>();
  for (const dep of allDeps) {
    const list = depsTo.get(dep.toTaskId) ?? [];
    list.push(dep.fromTaskId);
    depsTo.set(dep.toTaskId, list);
  }

  // Headers — identical to the import template so the file is re-importable
  const headers = [
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

  const rows: (string | number | boolean)[][] = [headers];

  tasks.forEach((task, idx) => {
    const parentTitle = task.parentTaskId ? (titleById.get(task.parentTaskId) ?? "") : "";
    const depTitles = (depsTo.get(task.id) ?? [])
      .map((id) => titleById.get(id) ?? "")
      .filter(Boolean)
      .join(",");

    rows.push([
      idx === 0 ? projectName : "", // project_name — only on first row
      "", // project_description — left blank (not stored per-task)
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

  const ws = xlsx.utils.aoa_to_sheet(rows);

  // Column widths
  const colWidths = [20, 24, 36, 36, 30, 12, 12, 14, 10, 10, 10, 30];
  ws["!cols"] = colWidths.map((wch) => ({ wch }));

  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Tasks");

  const safeFilename = projectName
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  xlsx.writeFile(wb, `${safeFilename}-gantt.xlsx`);
}
