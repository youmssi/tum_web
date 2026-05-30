import { api } from "@/lib/api-client";

export interface ProjectExportFile {
  blob: Blob;
  filename: string;
}

const FALLBACK_FILENAME = "project-archive.xlsx";

function filenameFromContentDisposition(header: string | null): string {
  if (!header) return FALLBACK_FILENAME;
  // Prefer the RFC 5987 form ("filename*=UTF-8''…") if present so non-ASCII project names survive.
  const utf8 = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8 && utf8[1]) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {
      // fall through to the plain form
    }
  }
  const plain = header.match(/filename="?([^";]+)"?/i);
  return plain && plain[1] ? plain[1] : FALLBACK_FILENAME;
}

export const exportApi = {
  /**
   * Downloads the project's archive workbook. The browser-side endpoint streams an XLSX of every
   * sheet — Cover, Tasks, Comments, Members, Activity, Audit, Statuses, plus a hidden Lookups
   * sheet — with Excel data validation dropdowns and named ranges so the file stays interactive
   * once opened.
   */
  archiveXlsx: async (projectId: string): Promise<ProjectExportFile> => {
    // Wider timeout than the default 20s — large projects with audit history can take a few
    // seconds to serialise on the backend.
    const response = await api.get(`api/projects/${projectId}/export.xlsx`, { timeout: 60_000 });
    const blob = await response.blob();
    const filename = filenameFromContentDisposition(response.headers.get("content-disposition"));
    return { blob, filename };
  },
};
