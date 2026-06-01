import { useMutation } from "@tanstack/react-query";

import { exportApi } from "./export-api";

interface ExportInput {
  projectId: string;
  /**
   * Display name of the project — used to derive the saved filename. Strongly preferred over the
   * server-side fallback because Content-Disposition is often invisible to the browser when the
   * download is fetched across origins (Spring CORS doesn't expose it).
   */
  projectName: string;
}

/**
 * Slugifies a project name for a download filename. Mirrors the backend's
 * {@code Prepared.suggestedFilename} so the local name matches what would have come back over
 * Content-Disposition.
 */
function filenameFromProject(projectName: string): string {
  const slug = projectName
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const day = new Date().toISOString().slice(0, 10);
  return `${slug || "project"}-archive-${day}.xlsx`;
}

/**
 * Mutation hook that downloads a project's archive XLSX and triggers a browser download. Uses a
 * temporary anchor element rather than {@code window.open} so the {@code download} attribute
 * sticks (Safari and Firefox both ignore Content-Disposition for window.open navigations).
 *
 * <p>The local filename derived from the project name always wins — the server filename only
 * matters when this hook is consumed without a project name (it currently isn't, but the fallback
 * keeps the API forgiving).
 */
export function useExportProjectArchive() {
  return useMutation({
    mutationFn: async ({ projectId, projectName }: ExportInput) => {
      const { blob, filename: serverFilename } = await exportApi.archiveXlsx(projectId);
      const filename = projectName ? filenameFromProject(projectName) : serverFilename;
      const url = URL.createObjectURL(blob);
      try {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      } finally {
        // Defer revocation by a tick — some browsers (Safari) cancel the download if the URL is
        // revoked synchronously after click().
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      return filename;
    },
  });
}
