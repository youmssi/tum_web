"use client";

import {
  CalendarCheck2Icon,
  LinkIcon,
  Maximize2Icon,
  Minimize2Icon,
  TableIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type Task } from "@/components/modules/tasks";
import { type GanttViewMode } from "./gantt-chart";
import { type Dependency } from "./dependency-api";
import { exportGanttXlsx } from "./timeline-export";

interface TimelineToolbarProps {
  viewMode: GanttViewMode;
  onViewModeChange: (mode: GanttViewMode) => void;
  linkMode: boolean;
  onLinkModeChange: (active: boolean) => void;
  colors: { onTrackColor: string; nearDueColor: string; overdueColor: string };
  tasks: Task[];
  allDeps: Dependency[];
  projectName?: string;
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
  tasks,
  allDeps,
  projectName,
  isFocused,
  onFocusToggle,
  onJumpToToday,
}: TimelineToolbarProps) {
  const t = useTranslations("timeline.toolbar");
  const viewModeT = useTranslations("timeline.viewMode");
  const legendT = useTranslations("timeline.legend");
  const exporting = useRef(false);

  async function handleExportXlsx() {
    if (exporting.current) return;
    exporting.current = true;
    try {
      await exportGanttXlsx(tasks, allDeps, projectName ?? "project");
    } catch {
      toast.error(t("exportXlsxTooltip"));
    } finally {
      exporting.current = false;
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

        {/* Export XLSX */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleExportXlsx}>
              <TableIcon className="size-3.5" />
              {t("exportXlsx")}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t("exportXlsxTooltip")}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
