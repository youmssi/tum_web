"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AlertCircleIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { STATUS_LABELS, type Task, taskApi } from "@/components/modules/tasks";
import { ROUTES } from "@/lib/constants";
import { useDebounce } from "./use-debounce";
import { useCommandPalette } from "./use-command-palette";

function useTaskSearch(q: string) {
  return useQuery({
    queryKey: ["tasks-search", q],
    queryFn: () => taskApi.search(q.trim()),
    enabled: q.trim().length >= 1,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
  });
}

export function CommandPalette() {
  const router = useRouter();
  const { open, closePalette, togglePalette } = useCommandPalette();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const { data: results = [], isFetching, isError } = useTaskSearch(debouncedQuery);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        togglePalette();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [togglePalette]);

  function handleSelect(task: Task) {
    closePalette();
    router.push(`${ROUTES.PROJECTS}/${task.projectId}?task=${task.id}`);
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      closePalette();
      setQuery("");
    }
  }

  const trimmed = debouncedQuery.trim();
  const hasQuery = trimmed.length >= 1;

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange} title="Search tasks">
      <Command>
        <CommandInput placeholder="Search tasks by title…" value={query} onValueChange={setQuery} />
        <CommandList>
          {!hasQuery ? (
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-2 text-muted-foreground">
                <SearchIcon className="size-8 opacity-40" />
                <p className="text-sm">Search across all tasks</p>
                <p className="text-xs opacity-70">Type at least one character to search</p>
              </div>
            </CommandEmpty>
          ) : isFetching ? (
            <CommandEmpty>
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" />
                Searching…
              </div>
            </CommandEmpty>
          ) : isError ? (
            <CommandEmpty>
              <div className="flex flex-col items-center gap-1.5 py-4 text-sm text-muted-foreground">
                <AlertCircleIcon className="size-5 text-destructive" />
                Search failed. Try again.
              </div>
            </CommandEmpty>
          ) : results.length === 0 ? (
            <CommandEmpty>No tasks found for &ldquo;{trimmed}&rdquo;.</CommandEmpty>
          ) : (
            <CommandGroup
              heading={`${results.length} task${results.length !== 1 ? "s" : ""} found`}
            >
              {results.map((task) => (
                <CommandItem key={task.id} value={task.id} onSelect={() => handleSelect(task)}>
                  <div className="flex flex-col gap-0.5 py-0.5">
                    <span className="text-sm font-medium">{task.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {STATUS_LABELS[task.status]}
                      {task.priority && ` · ${task.priority}`}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {hasQuery && results.length > 0 && (
            <>
              <CommandSeparator />
              <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
                <span>Press Enter to open</span>
                <KbdGroup>
                  <Kbd>Esc</Kbd>
                  <span>to close</span>
                </KbdGroup>
              </div>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
