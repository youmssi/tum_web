/**
 * Gantt chart export utilities.
 *
 * PNG: uses html-to-image (MIT, 2M+ weekly downloads) to capture the Gantt
 * container as rendered, with all computed CSS correctly inlined. This fixes
 * the black-rectangle issue caused by getComputedStyle on detached clones.
 *
 * html-to-image is browser-only and must be imported dynamically so Next.js
 * server-side module analysis never tries to evaluate it.
 *
 * PDF: opens a minimal print window so the browser's native print dialog
 * gets clean content (the parent page's chrome is excluded).
 */

export async function exportGanttPng(container: HTMLElement, filename = "gantt"): Promise<void> {
  const { toPng } = await import("html-to-image");

  // html-to-image only captures what is painted inside the element's clipping rect.
  // Both the outer container (overflow-hidden) and the right Gantt panel (overflow-auto)
  // clip their content, hiding everything outside the visible viewport.
  //
  // Fix: walk the subtree bottom-up and temporarily expand every overflow-constrained
  // element to its full scroll dimensions via inline styles (inline specificity overrides
  // the Tailwind class, so getComputedStyle returns "visible" inside the clone).
  type Snap = { el: HTMLElement; overflow: string; width: string; height: string };
  const snaps: Snap[] = [];

  function expand(el: HTMLElement): void {
    // Children first (bottom-up) so parent scroll dimensions already include expanded children
    for (const child of Array.from(el.children)) expand(child as HTMLElement);
    const cs = window.getComputedStyle(el);
    if (cs.overflow === "visible" && cs.overflowX === "visible" && cs.overflowY === "visible")
      return;
    snaps.push({ el, overflow: el.style.overflow, width: el.style.width, height: el.style.height });
    el.style.overflow = "visible";
    // Pin to whichever is larger: rendered size or scroll content size
    el.style.width = Math.max(el.offsetWidth, el.scrollWidth) + "px";
    el.style.height = Math.max(el.offsetHeight, el.scrollHeight) + "px";
  }

  expand(container);

  // Read triggers a synchronous reflow so scrollWidth/Height are correct after expansion
  void container.offsetWidth;
  const totalW = container.scrollWidth;
  const totalH = container.scrollHeight;

  try {
    const dataUrl = await toPng(container, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
      skipFonts: true,
      width: totalW,
      height: totalH,
    });
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } finally {
    for (const { el, overflow, width, height } of snaps) {
      el.style.overflow = overflow;
      el.style.width = width;
      el.style.height = height;
    }
  }
}

function findGanttSvg(container: HTMLElement): SVGSVGElement | null {
  return container.querySelector<SVGSVGElement>("svg.gantt");
}

function inlineComputedFills(originalSvg: SVGSVGElement, svgClone: SVGSVGElement): void {
  const originalEls = Array.from(originalSvg.querySelectorAll<SVGElement>("[class]"));
  const clonedEls = Array.from(svgClone.querySelectorAll<SVGElement>("[class]"));
  originalEls.forEach((orig, i) => {
    const clone = clonedEls[i];
    if (!clone) return;
    const computed = window.getComputedStyle(orig);
    const fill = computed.fill;
    if (fill && fill !== "none") clone.style.fill = fill;
    const stroke = computed.stroke;
    if (stroke && stroke !== "none") clone.style.stroke = stroke;
  });
}

export function exportGanttPdf(container: HTMLElement | null, filename = "gantt"): void {
  const svg = container ? findGanttSvg(container) : null;

  if (!svg) {
    window.print();
    return;
  }

  const svgClone = svg.cloneNode(true) as SVGSVGElement;
  svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  inlineComputedFills(svg, svgClone);

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
