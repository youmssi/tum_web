"use client";

import { DownloadIcon, FileTextIcon, ImageIcon, LinkIcon } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type GanttViewMode } from "./gantt-chart";
import { exportGanttPdf, exportGanttPng } from "./timeline-export";

interface TimelineToolbarProps {
  viewMode: GanttViewMode;
  onViewModeChange: (mode: GanttViewMode) => void;
  linkMode: boolean;
  onLinkModeChange: (active: boolean) => void;
  colors: { onTrackColor: string; nearDueColor: string; overdueColor: string };
  ganttContainerRef: React.RefObject<HTMLDivElement | null>;
  projectName?: string;
}

const VIEW_MODES: GanttViewMode[] = ["Day", "Week", "Month"];

export function TimelineToolbar({
  viewMode,
  onViewModeChange,
  linkMode,
  onLinkModeChange,
  colors,
  ganttContainerRef,
  projectName = "gantt",
}: TimelineToolbarProps) {
  const exporting = useRef(false);

  async function handleExportPng() {
    if (exporting.current || !ganttContainerRef.current) return;
    exporting.current = true;
    try {
      await exportGanttPng(ganttContainerRef.current, projectName);
    } catch {
      toast.error("Failed to export PNG.");
    } finally {
      exporting.current = false;
    }
  }

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
            {mode}
          </Button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3">
        {[
          { label: "On track", color: colors.onTrackColor },
          { label: "Near due", color: colors.nearDueColor },
          { label: "Overdue", color: colors.overdueColor },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Link mode toggle */}
        <Button
          variant={linkMode ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => onLinkModeChange(!linkMode)}
          title={
            linkMode ? "Exit link mode (Esc)" : "Link tasks — click two bars to create a dependency"
          }
        >
          <LinkIcon className="size-3.5" />
          {linkMode ? "Cancel linking" : "Link tasks"}
        </Button>

        {/* Export */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <DownloadIcon className="size-3.5" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportPng} className="gap-2">
              <ImageIcon className="size-4" />
              Download PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportGanttPdf} className="gap-2">
              <FileTextIcon className="size-4" />
              Print / Save as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
