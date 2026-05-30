import { useMutation } from "@tanstack/react-query";

import { exportApi } from "./export-api";

/**
 * Mutation hook that downloads a project's archive XLSX and triggers a browser download. Triggers
 * a real navigation via a temporary anchor element rather than `window.open` so the response sticks
 * to its filename (some browsers ignore Content-Disposition for navigation-style downloads).
 */
export function useExportProjectArchive() {
  return useMutation({
    mutationFn: async (projectId: string) => {
      const { blob, filename } = await exportApi.archiveXlsx(projectId);
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
