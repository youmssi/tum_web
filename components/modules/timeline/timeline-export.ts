import html2canvas from "html2canvas";

export async function exportGanttPng(container: HTMLElement, filename = "gantt"): Promise<void> {
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });
  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function exportGanttPdf(): void {
  window.print();
}
