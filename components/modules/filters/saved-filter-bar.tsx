"use client";

import { RotateCcwIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDirectory } from "../organization";

import type { SavedFilterConfig } from "./saved-filter-api";

interface SavedFilterBarProps {
  config: SavedFilterConfig;
  onClearDimension: (key: keyof SavedFilterConfig) => void;
  onClearAll: () => void;
}

export function SavedFilterBar({ config, onClearDimension, onClearAll }: SavedFilterBarProps) {
  const { data: directory } = useDirectory();
  const badges: { label: string; key: keyof SavedFilterConfig }[] = [];

  if (config.statuses?.length) {
    badges.push({ label: `${config.statuses.length} status${config.statuses.length > 1 ? "es" : ""}`, key: "statuses" });
  }
  if (config.priorities?.length) {
    badges.push({ label: `${config.priorities.length} priorit${config.priorities.length > 1 ? "ies" : "y"}`, key: "priorities" });
  }
  if (config.assigneeIds?.length) {
    const names = config.assigneeIds
      .map((id) => {
        if (id === "__me__") return "Me";
        return directory?.find((m) => m.userId === id)?.name ?? id.slice(0, 8);
      })
      .join(", ");
    badges.push({ label: names, key: "assigneeIds" });
  }
  if (config.labels?.length) {
    badges.push({ label: `${config.labels.length} label${config.labels.length > 1 ? "s" : ""}`, key: "labels" });
  }
  if (config.dueFrom || config.dueTo) {
    badges.push({ label: "Due date range", key: "dueFrom" });
  }
  if (config.q) {
    badges.push({ label: `"${config.q}"`, key: "q" });
  }
  if (config.customFields && Object.keys(config.customFields).length > 0) {
    badges.push({ label: `${Object.keys(config.customFields).length} custom field${Object.keys(config.customFields).length > 1 ? "s" : ""}`, key: "customFields" });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {badges.map((b) => (
        <Badge key={b.key} variant="secondary" className="gap-1 pr-1 text-xs">
          {b.label}
          <button
            className="ml-0.5 rounded-sm p-0.5 hover:bg-muted-foreground/20"
            onClick={() => onClearDimension(b.key)}
            aria-label={`Remove ${b.key} filter`}
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs text-muted-foreground" onClick={onClearAll}>
        <RotateCcwIcon className="size-3" />
        Clear all
      </Button>
    </div>
  );
}
