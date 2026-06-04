import Papa from "papaparse";
import type { ImportTaskRow } from "./import-api";

export interface ParsedImport {
  projectName: string;
  projectDescription: string | null;
  tasks: ImportTaskRow[];
  warnings: string[];
}

const STATUSES = new Set(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]);
const PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const TRUTHY = new Set(["TRUE", "YES", "1"]);

function normaliseStatus(s: string | undefined): string | null {
  if (!s) return null;
  const upper = s.trim().toUpperCase().replace(/\s+/g, "_");
  return STATUSES.has(upper) ? upper : null;
}

function normalisePriority(s: string | undefined): string | null {
  if (!s) return null;
  const upper = s.trim().toUpperCase();
  return PRIORITIES.has(upper) ? upper : null;
}

function normaliseDate(s: string | undefined): string | null {
  if (!s || !s.trim()) return null;
  const v = s.trim();
  // YYYY-MM-DD already
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  // M/D/YYYY or D/M/YYYY — try both; prefer Date.parse to guess
  const slashMatch = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, a, b, y] = slashMatch;
    // If first part > 12 it must be day-first
    const month = parseInt(a) > 12 ? b : a;
    const day = parseInt(a) > 12 ? a : b;
    const iso = `${y}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    if (!isNaN(Date.parse(iso))) return iso;
  }
  // MM-DD-YYYY
  const dashMatch = v.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dashMatch) {
    const [, m, d, y] = dashMatch;
    return `${y}-${m}-${d}`;
  }
  return null;
}

function normaliseProgress(s: string | undefined): number | null {
  if (!s || !s.trim()) return null;
  const n = parseInt(s.trim(), 10);
  if (isNaN(n)) return null;
  return Math.max(0, Math.min(100, n));
}

function normaliseMilestone(s: string | undefined): boolean | null {
  if (!s || !s.trim()) return null;
  const upper = s.trim().toUpperCase();
  if (TRUTHY.has(upper)) return true;
  if (upper === "FALSE" || upper === "NO" || upper === "0") return false;
  return null;
}

function normaliseLabels(s: string | undefined): string[] | null {
  if (!s || !s.trim()) return null;
  const parts = s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : null;
}

function normaliseDependsOn(s: string | undefined): string[] | null {
  if (!s || !s.trim()) return null;
  const parts = s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : null;
}

type RawRow = Record<string, string | undefined>;

export function parseCsv(file: File): Promise<ParsedImport> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
      complete(results) {
        const warnings: string[] = [];

        if (results.errors.length > 0) {
          warnings.push(...results.errors.map((e) => `Row ${e.row ?? "?"}: ${e.message}`));
        }

        const rows = results.data;
        if (rows.length === 0) {
          reject(new Error("CSV is empty or has no data rows."));
          return;
        }

        // Project name/description from first row where project_name is non-empty
        const metaRow = rows.find((r) => r.project_name?.trim());
        if (!metaRow?.project_name?.trim()) {
          reject(
            new Error("No project_name found. Make sure the first data row has a project_name."),
          );
          return;
        }
        const projectName = metaRow.project_name.trim();
        const projectDescription = metaRow.project_description?.trim() || null;

        const tasks: ImportTaskRow[] = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const title = (row.title ?? "").trim();
          if (!title) continue; // skip rows with no task title

          const startDate = normaliseDate(row.start_date);
          const endDate = normaliseDate(row.end_date);

          if (row.start_date?.trim() && !startDate)
            warnings.push(`Row ${i + 2}: unrecognised start_date "${row.start_date}" — skipped`);
          if (row.end_date?.trim() && !endDate)
            warnings.push(`Row ${i + 2}: unrecognised end_date "${row.end_date}" — skipped`);

          tasks.push({
            title,
            description: row.description?.trim() || null,
            startDate,
            endDate,
            status: normaliseStatus(row.status),
            priority: normalisePriority(row.priority),
            progress: normaliseProgress(row.progress),
            milestone: normaliseMilestone(row.milestone),
            parentTask: row.parent_task?.trim() || null,
            dependsOn: normaliseDependsOn(row.depends_on),
            labels: normaliseLabels(row.labels),
            dueDate: normaliseDate(row.due_date),
            assignee: row.assignee?.trim() || null,
          });
        }

        if (tasks.length === 0) {
          reject(new Error("No tasks found. Each task row needs a non-empty title column."));
          return;
        }

        resolve({ projectName, projectDescription, tasks, warnings });
      },
      error(err) {
        reject(err);
      },
    });
  });
}
