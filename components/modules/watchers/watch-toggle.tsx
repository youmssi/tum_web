"use client";

import { BellIcon, BellOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useIsWatching, useToggleWatch } from "./use-watcher";

interface WatchToggleProps {
  taskId: string;
}

export function WatchToggle({ taskId }: WatchToggleProps) {
  const { data, isLoading } = useIsWatching(taskId);
  const toggleMutation = useToggleWatch();

  const isWatching = data?.watching ?? false;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={toggleMutation.isPending || isLoading}
          onClick={() => toggleMutation.mutate({ taskId })}
          aria-label={isWatching ? "Unwatch task" : "Watch task"}
        >
          {isWatching ? (
            <BellIcon className="h-4 w-4 text-primary" />
          ) : (
            <BellOffIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {isWatching ? "Stop watching this task" : "Watch this task"}
      </TooltipContent>
    </Tooltip>
  );
}
