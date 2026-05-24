"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { STATUS_LABELS, type Task, taskApi } from "@/components/modules/tasks";
import { ROUTES } from "@/lib/constants";
import { useDebounce } from "./use-debounce";

function useTaskSearch(q: string) {
  return useQuery({
    queryKey: ["tasks-search", q],
    queryFn: () => taskApi.search(q),
    enabled: q.trim().length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { data: results = [], isFetching } = useTaskSearch(debouncedQuery);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSelect(task: Task) {
    setOpen(false);
    router.push(`${ROUTES.PROJECTS}/${task.projectId}?task=${task.id}`);
  }

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) setQuery("");
  }

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput placeholder="Search tasks…" value={query} onValueChange={setQuery} />
      <CommandList>
        {isFetching && debouncedQuery.trim() ? (
          <CommandEmpty>Searching&hellip;</CommandEmpty>
        ) : !query.trim() ? (
          <CommandEmpty>
            <SearchIcon className="mx-auto mb-2 size-8 text-muted-foreground" />
            <span>Type to search tasks&hellip;</span>
          </CommandEmpty>
        ) : results.length === 0 ? (
          <CommandEmpty>No tasks found for &ldquo;{query}&rdquo;.</CommandEmpty>
        ) : (
          <CommandGroup heading="Tasks">
            {results.map((task) => (
              <CommandItem key={task.id} onSelect={() => handleSelect(task)}>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{task.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
