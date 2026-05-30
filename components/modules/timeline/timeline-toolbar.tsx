"use client";

import {
  CalendarCheck2Icon,
  FileSpreadsheetIcon,
  LinkIcon,
  Loader2Icon,
  Maximize2Icon,
  Minimize2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useExportProjectArchive } from "@/components/modules/projects";
import { type GanttViewMode } from "./gantt-chart";

interface TimelineToolbarProps {
  viewMode: GanttViewMode;
  onViewModeChange: (mode: GanttViewMode) => void;
  linkMode: boolean;
  onLinkModeChange: (active: boolean) => void;
  colors: { onTrackColor: string; nearDueColor: string; overdueColor: string };
  projectId: string;
  isFocused: boolean;
  onFocusToggle: () => void;
  onJumpToToday: () => void;
}

const VIEW_MODES: GanttViewMode[] = ["Day", "Week", "Month"];

export function TimelineToolbar({
  viewMode,
  onViewModeChange,
  linkMode,
  onLinkModeChange,
  colors,
  projectId,
  isFocused,
  onFocusToggle,
  onJumpToToday,
}: TimelineToolbarProps) {
  const t = useTranslations("timeline.toolbar");
  const tExport = useTranslations("projects.export");
  const viewModeT = useTranslations("timeline.viewMode");
  const legendT = useTranslations("timeline.legend");
  const exportArchive = useExportProjectArchive();

  async function handleExportXlsx() {
    try {
      const filename = await exportArchive.mutateAsync(projectId);
      toast.success(tExport("ready", { filename }));
    } catch (error) {
      const message = error instanceof Error ? error.message : tExport("failed");
      toast.error(message);
    }
  }

  const legend: { label: string; color: string }[] = [
    { label: legendT("onTrack"), color: colors.onTrackColor },
    { label: legendT("nearDue"), color: colors.nearDueColor },
    { label: legendT("overdue"), color: colors.overdueColor },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Zoom controls */}
      <div className="flex items-center rounded-md border p-0.5">
        {VIEW_MODES.map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => onViewModeChange(mode)}
          >
            {viewModeT(mode)}
          </Button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3">
        {legend.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Jump to today */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={onJumpToToday}>
              <CalendarCheck2Icon className="size-3.5" />
              {t("today")}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t("todayTooltip")}</TooltipContent>
        </Tooltip>

        {/* Link mode toggle */}
        <Button
          variant={linkMode ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => onLinkModeChange(!linkMode)}
          title={linkMode ? t("cancelLinkingTooltip") : t("linkTasksTooltip")}
        >
          <LinkIcon className="size-3.5" />
          {linkMode ? t("cancelLinking") : t("linkTasks")}
        </Button>

        {/* Focus mode toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isFocused ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onFocusToggle}
              aria-label={isFocused ? t("focusExit") : t("focusEnter")}
            >
              {isFocused ? (
                <Minimize2Icon className="size-3.5" />
              ) : (
                <Maximize2Icon className="size-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isFocused ? t("focusExit") : t("focusEnter")}
          </TooltipContent>
        </Tooltip>

        {/* Export project archive — the interactive XLSX with dropdowns, filters and formulas. */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={handleExportXlsx}
              disabled={exportArchive.isPending}
            >
              {exportArchive.isPending ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <FileSpreadsheetIcon className="size-3.5" />
              )}
              {exportArchive.isPending ? tExport("preparing") : tExport("button")}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t("exportXlsxTooltip")}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
