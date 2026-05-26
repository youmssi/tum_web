/**
 * Gantt chart export utilities.
 *
 * PNG: serialises the Frappe Gantt SVG directly to a canvas (avoids html2canvas
 * failures on SVG elements). Computed CSS fills are inlined before serialisation
 * so custom bar colours survive the round-trip.
 *
 * PDF: opens a minimal print window containing only the SVG so the browser's
 * native print dialog gets clean content (the parent page's chrome is excluded).
 */

function findGanttSvg(container: HTMLElement): SVGSVGElement | null {
  return container.querySelector<SVGSVGElement>("svg.gantt");
}

function inlineComputedFills(svgClone: SVGSVGElement): void {
  const elements = svgClone.querySelectorAll<SVGElement>("[class]");
  elements.forEach((el) => {
    const computed = window.getComputedStyle(el);
    const fill = computed.fill;
    if (fill && fill !== "none" && fill !== "rgba(0, 0, 0, 0)") {
      el.style.fill = fill;
    }
    const stroke = computed.stroke;
    if (stroke && stroke !== "none" && stroke !== "rgba(0, 0, 0, 0)") {
      el.style.stroke = stroke;
    }
  });
}

export async function exportGanttPng(container: HTMLElement, filename = "gantt"): Promise<void> {
  const svg = findGanttSvg(container);
  if (!svg) throw new Error("Gantt SVG not found");

  const rect = svg.getBoundingClientRect();
  const svgClone = svg.cloneNode(true) as SVGSVGElement;

  svgClone.setAttribute("width", String(rect.width));
  svgClone.setAttribute("height", String(rect.height));
  svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  inlineComputedFills(svgClone);

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgClone);
  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(scale, scale);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG image load failed"));
    };
    img.src = url;
  });
}

export function exportGanttPdf(container: HTMLElement | null, filename = "gantt"): void {
  const svg = container ? findGanttSvg(container) : null;

  if (!svg) {
    // Fallback: print the whole page
    window.print();
    return;
  }

  const svgClone = svg.cloneNode(true) as SVGSVGElement;
  svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  inlineComputedFills(svgClone);

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgClone);

  const printWindow = window.open("", "_blank", "width=1200,height=800");
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${filename}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; display: flex; justify-content: center; align-items: flex-start; }
    svg { max-width: 100%; height: auto; }
    @page { size: landscape; margin: 1cm; }
  </style>
</head>
<body>
  ${svgStr}
  <script>
    window.onload = function () {
      window.print();
      window.onafterprint = function () { window.close(); };
    };
  </script>
</body>
</html>`);
  printWindow.document.close();
}
