"use client";

import { FileSpreadsheetIcon, Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useExportProjectArchive } from "./use-export";

interface ExportProjectButtonProps {
  projectId: string;
  projectName: string;
}

/**
 * Downloads the project archive XLSX — every sheet (Cover, Tasks, Comments, Members, Activity,
 * Audit, Statuses) with Excel dropdowns, AutoFilter and computed columns. Audit rows are present
 * only when the caller is an org admin; member callers still get the rest of the workbook.
 *
 * <p>Filename derives from {@code projectName} on the client because the server's
 * Content-Disposition header is usually hidden by CORS — without it the file would download as
 * the generic fallback.
 */
export function ExportProjectButton({ projectId, projectName }: ExportProjectButtonProps) {
  const t = useTranslations("projects.export");
  const exportArchive = useExportProjectArchive();

  async function handleClick() {
    try {
      const filename = await exportArchive.mutateAsync({ projectId, projectName });
      toast.success(t("ready", { filename }));
    } catch (error) {
      const message = error instanceof Error ? error.message : t("failed");
      toast.error(message);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={exportArchive.isPending}>
      {exportArchive.isPending ? (
        <Loader2Icon className="mr-2 size-4 animate-spin" />
      ) : (
        <FileSpreadsheetIcon className="mr-2 size-4" />
      )}
      {exportArchive.isPending ? t("preparing") : t("button")}
    </Button>
  );
}
