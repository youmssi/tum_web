/**
 * Builds a self-contained SVG of a project schedule for export. It is drawn from the schedule data
 * rather than copied from the on-screen chart, so the result does not depend on scroll position,
 * screen size or the interactive library, and prints cleanly at any size.
 */

export type ExportTaskHealth = "onTrack" | "nearDue" | "overdue" | "done";
export type ExportScale = "Day" | "Week" | "Month";

export interface ExportTask {
  id: string;
  name: string;
  /** YYYY-MM-DD */
  start: string;
  /** YYYY-MM-DD, inclusive */
  end: string;
  progress: number;
  milestone: boolean;
  health: ExportTaskHealth;
  critical?: boolean;
}

export interface ExportDependency {
  from: string;
  to: string;
}

export interface GanttExportLabels {
  task: string;
  start: string;
  end: string;
  progress: string;
  today: string;
  critical: string;
  legend: Record<ExportTaskHealth, string>;
}

export interface GanttExportInput {
  title: string;
  subtitle?: string;
  /** Shown top right, e.g. "Exported on 15 Nov 2026". */
  stamp: string;
  /** Bottom line; on the Free plan it credits Tûm. */
  footer?: string;
  /**
   * Workspace logo as a data URI, drawn left of the title. It must be inlined: an image linked by
   * URL is dropped when the SVG is rasterised to PNG or printed.
   */
  logo?: string;
  tasks: ExportTask[];
  dependencies: ExportDependency[];
  colors: Record<ExportTaskHealth, string>;
  labels: GanttExportLabels;
  scale: ExportScale;
  locale: string;
  /** YYYY-MM-DD; the today marker is drawn when it falls inside the schedule. */
  today: string;
}

export interface GanttExport {
  svg: string;
  width: number;
  height: number;
}

const DAY_MS = 86_400_000;
const PX_PER_DAY: Record<ExportScale, number> = { Day: 28, Week: 9, Month: 3 };
const MARGIN = 32;
const HEADER = 76;
const AXIS = 44;
const ROW = 30;
const BAR = 16;
const LEGEND = 40;
const FOOTER = 28;
const LOGO = 48;
const RASTER_DATA_URI = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;
const NAME_COL = 260;
const DATE_COL = 84;
const PCT_COL = 44;
const LIST_WIDTH = NAME_COL + DATE_COL * 2 + PCT_COL;
const FONT = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const INK = "#0f172a";
const MUTED = "#64748b";
const GRID = "#e2e8f0";
const BAND = "#f8fafc";
const CRITICAL = "#dc2626";
const TODAY = "#e11d48";

function day(value: string): number {
  const [y, m, d] = value.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
}

function text(x: number, y: number, content: string, attrs = ""): string {
  return `<text x="${x}" y="${y}" ${attrs}>${escapeXml(content)}</text>`;
}

/** First day of each period shown on the axis, with its label. */
function ticks(first: number, last: number, scale: ExportScale, locale: string) {
  const result: { day: number; label: string; major: boolean }[] = [];
  const monthFormat = new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const dayFormat = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  for (let d = first; d <= last; d++) {
    const date = new Date(d * DAY_MS);
    const isMonthStart = date.getUTCDate() === 1;
    if (scale === "Month" && isMonthStart) {
      result.push({ day: d, label: monthFormat.format(date), major: true });
    } else if (scale === "Week" && date.getUTCDay() === 1) {
      result.push({ day: d, label: dayFormat.format(date), major: isMonthStart });
    } else if (scale === "Day") {
      result.push({ day: d, label: String(date.getUTCDate()), major: isMonthStart });
    }
  }
  return result;
}

export function buildGanttSvg(input: GanttExportInput): GanttExport {
  const tasks = input.tasks;
  const pxPerDay = PX_PER_DAY[input.scale];

  const starts = tasks.map((t) => day(t.start));
  const ends = tasks.map((t) => day(t.end));
  // A little air either side so the first and last bars do not touch the frame.
  const pad = input.scale === "Day" ? 2 : input.scale === "Week" ? 7 : 15;
  const first = (tasks.length ? Math.min(...starts) : day(input.today)) - pad;
  const last = (tasks.length ? Math.max(...ends) : day(input.today)) + pad;
  const span = last - first + 1;

  const chartLeft = MARGIN + LIST_WIDTH;
  const chartWidth = span * pxPerDay;
  const width = chartLeft + chartWidth + MARGIN;
  const rowsTop = MARGIN + HEADER + AXIS;
  const rowsHeight = Math.max(tasks.length, 1) * ROW;
  const height = rowsTop + rowsHeight + LEGEND + (input.footer ? FOOTER : 0) + MARGIN;
  const x = (d: number) => chartLeft + (d - first) * pxPerDay;
  const rowY = (index: number) => rowsTop + index * ROW;

  const parts: string[] = [];
  parts.push(`<rect width="${width}" height="${height}" fill="#ffffff"/>`);

  // Title block
  // Only an inlined raster image is accepted, so an export can never pull in a remote resource.
  const logo = input.logo && RASTER_DATA_URI.test(input.logo) ? input.logo : undefined;
  const titleX = logo ? MARGIN + LOGO + 12 : MARGIN;
  if (logo) {
    parts.push(
      `<image href="${escapeXml(logo)}" x="${MARGIN}" y="${MARGIN}" width="${LOGO}" height="${LOGO}" preserveAspectRatio="xMidYMid meet"/>`,
    );
  }
  parts.push(
    text(titleX, MARGIN + 22, input.title, `font-size="20" font-weight="700" fill="${INK}"`),
  );
  if (input.subtitle) {
    parts.push(text(titleX, MARGIN + 44, input.subtitle, `font-size="12" fill="${MUTED}"`));
  }
  parts.push(
    text(
      width - MARGIN,
      MARGIN + 22,
      input.stamp,
      `font-size="11" fill="${MUTED}" text-anchor="end"`,
    ),
  );

  // Column headers and axis
  const axisY = MARGIN + HEADER;
  parts.push(
    `<line x1="${MARGIN}" y1="${axisY + AXIS}" x2="${width - MARGIN}" y2="${axisY + AXIS}" stroke="${GRID}"/>`,
  );
  const headerY = axisY + AXIS - 12;
  const headerAttrs = `font-size="11" font-weight="600" fill="${MUTED}"`;
  parts.push(text(MARGIN, headerY, input.labels.task, headerAttrs));
  parts.push(text(MARGIN + NAME_COL, headerY, input.labels.start, headerAttrs));
  parts.push(text(MARGIN + NAME_COL + DATE_COL, headerY, input.labels.end, headerAttrs));
  parts.push(
    text(
      MARGIN + LIST_WIDTH - 12,
      headerY,
      input.labels.progress,
      `${headerAttrs} text-anchor="end"`,
    ),
  );

  for (const tick of ticks(first, last, input.scale, input.locale)) {
    const tx = x(tick.day);
    parts.push(
      `<line x1="${tx}" y1="${axisY + (tick.major ? 4 : 18)}" x2="${tx}" y2="${rowsTop + rowsHeight}" stroke="${GRID}" stroke-width="${tick.major ? 1 : 0.5}"/>`,
    );
    parts.push(text(tx + 3, headerY, tick.label, `font-size="10" fill="${MUTED}"`));
  }

  // Rows
  // The year only earns its column width when the schedule crosses into another year.
  const years = new Set([first, last].map((d) => new Date(d * DAY_MS).getUTCFullYear()));
  const dateFormat = new Intl.DateTimeFormat(input.locale, {
    day: "numeric",
    month: "short",
    ...(years.size > 1 ? { year: "numeric" as const } : {}),
    timeZone: "UTC",
  });
  const formatDate = (value: string) => dateFormat.format(new Date(day(value) * DAY_MS));
  const index = new Map(tasks.map((t, i) => [t.id, i]));

  tasks.forEach((task, i) => {
    const top = rowY(i);
    if (i % 2 === 1) {
      parts.push(
        `<rect x="${MARGIN}" y="${top}" width="${width - 2 * MARGIN}" height="${ROW}" fill="${BAND}"/>`,
      );
    }
    const baseline = top + ROW / 2 + 4;
    const cell = `font-size="11" fill="${INK}"`;
    parts.push(
      text(
        MARGIN,
        baseline,
        truncate(task.name, 38),
        `${cell}${task.milestone ? ' font-weight="600"' : ""}`,
      ),
    );
    parts.push(
      text(MARGIN + NAME_COL, baseline, formatDate(task.start), `font-size="11" fill="${MUTED}"`),
    );
    parts.push(
      text(
        MARGIN + NAME_COL + DATE_COL,
        baseline,
        formatDate(task.end),
        `font-size="11" fill="${MUTED}"`,
      ),
    );
    parts.push(
      text(
        MARGIN + LIST_WIDTH - 12,
        baseline,
        `${Math.round(task.progress)}%`,
        `font-size="11" fill="${MUTED}" text-anchor="end"`,
      ),
    );

    const color = input.colors[task.health];
    const outline = task.critical ? ` stroke="${CRITICAL}" stroke-width="2"` : "";
    const barTop = top + (ROW - BAR) / 2;
    if (task.milestone) {
      const cx = x(day(task.start)) + pxPerDay / 2;
      const cy = top + ROW / 2;
      const r = BAR / 2 + 1;
      parts.push(
        `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${color}"${outline}/>`,
      );
    } else {
      const bx = x(day(task.start));
      const bw = Math.max((day(task.end) - day(task.start) + 1) * pxPerDay, 3);
      const done = Math.max(0, Math.min(100, task.progress)) / 100;
      parts.push(
        `<rect x="${bx}" y="${barTop}" width="${bw}" height="${BAR}" rx="4" fill="${color}" fill-opacity="0.35"${outline}/>`,
      );
      if (done > 0) {
        parts.push(
          `<rect x="${bx}" y="${barTop}" width="${bw * done}" height="${BAR}" rx="4" fill="${color}"/>`,
        );
      }
    }
  });

  // Dependencies: elbow from the end of the predecessor to the start of the successor.
  for (const dep of input.dependencies) {
    const from = index.get(dep.from);
    const to = index.get(dep.to);
    if (from === undefined || to === undefined) continue;
    const a = tasks[from];
    const b = tasks[to];
    const sx = x(day(a.end) + 1) + (a.milestone ? -pxPerDay / 2 + BAR / 2 : 0);
    const sy = rowY(from) + ROW / 2;
    const ex = x(day(b.start)) + (b.milestone ? pxPerDay / 2 - BAR / 2 - 1 : 0);
    const ey = rowY(to) + ROW / 2;
    const stroke = a.critical && b.critical ? CRITICAL : "#94a3b8";
    const midX = sx + 8;
    // When the successor starts before there is room to turn, run along the gap between the rows
    // and come back, instead of drawing the line back across the bars.
    const route =
      ex - 4 >= midX
        ? `M${sx},${sy} H${midX} V${ey} H${ex - 4}`
        : `M${sx},${sy} H${midX} V${ey - (ey > sy ? ROW / 2 : -ROW / 2)} H${ex - 12} V${ey} H${ex - 4}`;
    parts.push(`<path d="${route}" fill="none" stroke="${stroke}" stroke-width="1.25"/>`);
    parts.push(
      `<polygon points="${ex},${ey} ${ex - 6},${ey - 3.5} ${ex - 6},${ey + 3.5}" fill="${stroke}"/>`,
    );
  }

  // Today marker
  const today = day(input.today);
  if (today >= first && today <= last) {
    const tx = x(today) + pxPerDay / 2;
    parts.push(
      `<line x1="${tx}" y1="${axisY + 4}" x2="${tx}" y2="${rowsTop + rowsHeight}" stroke="${TODAY}" stroke-width="1.5" stroke-dasharray="4 3"/>`,
    );
    parts.push(
      text(
        tx + 4,
        axisY + 14,
        input.labels.today,
        `font-size="10" font-weight="600" fill="${TODAY}"`,
      ),
    );
  }

  // Legend
  const legendY = rowsTop + rowsHeight + 26;
  let lx = MARGIN;
  const healths: ExportTaskHealth[] = ["onTrack", "nearDue", "overdue", "done"];
  for (const health of healths) {
    parts.push(
      `<rect x="${lx}" y="${legendY - 9}" width="10" height="10" rx="2" fill="${input.colors[health]}"/>`,
    );
    const label = input.labels.legend[health];
    parts.push(text(lx + 16, legendY, label, `font-size="11" fill="${MUTED}"`));
    lx += 16 + label.length * 6.5 + 20;
  }
  if (tasks.some((t) => t.critical)) {
    parts.push(
      `<rect x="${lx}" y="${legendY - 9}" width="10" height="10" rx="2" fill="none" stroke="${CRITICAL}" stroke-width="2"/>`,
    );
    parts.push(text(lx + 16, legendY, input.labels.critical, `font-size="11" fill="${MUTED}"`));
  }

  if (input.footer) {
    parts.push(text(MARGIN, height - MARGIN + 4, input.footer, `font-size="10" fill="${MUTED}"`));
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="${FONT}">` +
    `<title>${escapeXml(input.title)}</title>` +
    parts.join("") +
    `</svg>`;
  return { svg, width, height };
}

/** Same rule as the on-screen chart: done, then overdue, then due within `nearDueDays`. */
export function taskHealth(
  task: { status: string; endDate: string | null },
  nearDueDays: number,
  now: number,
): ExportTaskHealth {
  if (task.status === "DONE") return "done";
  if (!task.endDate) return "onTrack";
  const end = day(task.endDate) * DAY_MS;
  if (end < now) return "overdue";
  if (end - now < nearDueDays * DAY_MS) return "nearDue";
  return "onTrack";
}
