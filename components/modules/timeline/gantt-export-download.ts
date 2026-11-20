import type { GanttExport } from "./gantt-export";

export type GanttExportFormat = "png" | "svg" | "pdf";

/** Browsers refuse canvases much beyond this on either side. */
const MAX_CANVAS_SIDE = 16_000;

export function timelineFilename(
  projectName: string,
  format: GanttExportFormat,
  date = new Date(),
) {
  const slug = projectName
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "project"}-timeline-${date.toISOString().slice(0, 10)}.${format}`;
}

/** Pixel ratio for the PNG: sharp on high-density screens, but within what a canvas accepts. */
export function pngScale(width: number, height: number): number {
  return Math.min(2, MAX_CANVAS_SIDE / width, MAX_CANVAS_SIDE / height);
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function svgBlob(gantt: GanttExport) {
  return new Blob([gantt.svg], { type: "image/svg+xml;charset=utf-8" });
}

export function downloadSvg(gantt: GanttExport, filename: string) {
  download(svgBlob(gantt), filename);
}

export async function downloadPng(gantt: GanttExport, filename: string) {
  const scale = pngScale(gantt.width, gantt.height);
  const url = URL.createObjectURL(svgBlob(gantt));
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(gantt.width * scale);
    canvas.height = Math.round(gantt.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available");
    context.scale(scale, scale);
    context.drawImage(image, 0, 0, gantt.width, gantt.height);

    const png = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("PNG encoding failed"))),
        "image/png",
      ),
    );
    download(png, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Opens the browser's print dialog on the chart alone, laid out on a landscape page, where the
 * user saves it as PDF. The browser prints the SVG as vectors, so the PDF stays sharp at any zoom.
 */
export function printPdf(gantt: GanttExport, title: string) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(frame);

  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    throw new Error("Printing is not available");
  }
  const escapedTitle = title.replace(
    /[<&>]/g,
    (c) => ({ "<": "&lt;", "&": "&amp;", ">": "&gt;" })[c] ?? c,
  );
  doc.open();
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${escapedTitle}</title>` +
      "<style>@page{size:landscape;margin:10mm}html,body{margin:0}svg{width:100%;height:auto;display:block}</style>" +
      `</head><body>${gantt.svg}</body></html>`,
  );
  doc.close();

  const cleanUp = () => setTimeout(() => frame.remove(), 500);
  win.addEventListener("afterprint", cleanUp, { once: true });
  win.focus();
  win.print();
  // Some browsers never fire afterprint for an iframe; do not leave it behind.
  setTimeout(() => frame.isConnected && frame.remove(), 60_000);
}

const LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

/**
 * Reads the workspace logo into a data URI the export can embed. Any failure (expired link,
 * blocked request, unsupported or oversized file) yields undefined: the export then goes out
 * without a logo rather than not at all.
 */
export async function loadLogoDataUri(url: string | null | undefined): Promise<string | undefined> {
  if (!url) return undefined;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
    if (!response.ok) return undefined;
    const blob = await response.blob();
    if (!LOGO_TYPES.has(blob.type) || blob.size > MAX_LOGO_BYTES) return undefined;
    return await new Promise<string | undefined>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : undefined);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}
