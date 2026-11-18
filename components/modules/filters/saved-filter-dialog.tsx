"use client";

import { BookmarkIcon, CheckIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import type { SavedFilter, SavedFilterConfig } from "./saved-filter-api";
import { useCreateSavedFilter, useDeleteSavedFilter, useSavedFilters, useSetDefaultFilter, useUpdateSavedFilter } from "./use-saved-filters";

interface SavedFilterDialogProps {
  projectId?: string;
  currentConfig: SavedFilterConfig;
  /** Called when the user selects a saved filter to apply */
  onApplyFilter: (config: SavedFilterConfig, name?: string) => void;
  /** Called when the user clears the current filter */
  onClearFilter: () => void;
  /** The name of the currently applied filter, if any */
  activeFilterName?: string;
}

export function SavedFilterDialog({
  projectId,
  currentConfig,
  onApplyFilter,
  onClearFilter,
  activeFilterName,
}: SavedFilterDialogProps) {
  const { data: savedFilters, isLoading } = useSavedFilters(projectId);
  const createFilter = useCreateSavedFilter(projectId);
  const updateFilter = useUpdateSavedFilter();
  const deleteFilter = useDeleteSavedFilter();
  const setDefault = useSetDefaultFilter();

  const [open, setOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [filterName, setFilterName] = useState("");
  const [renameName, setRenameName] = useState("");

  async function handleSave() {
    if (!filterName.trim()) return;
    try {
      await createFilter.mutateAsync({ name: filterName.trim(), config: currentConfig });
      setFilterName("");
      setSaveOpen(false);
    } catch {
      // toast handled by hook
    }
  }

  async function handleRename(id: string) {
    if (!renameName.trim()) return;
    try {
      await updateFilter.mutateAsync({ id, data: { name: renameName.trim() } });
      setRenameId(null);
      setRenameName("");
    } catch {
      // toast handled by hook
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteFilter.mutateAsync(id);
    } catch {
      // toast handled by hook
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await setDefault.mutateAsync(id);
    } catch {
      // toast handled by hook
    }
  }

  function handleApply(filter: SavedFilter) {
    onApplyFilter(filter.config, filter.name);
    setOpen(false);
  }

  return (
    <>
      {/* Save current filter */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <BookmarkIcon className="size-3.5" />
            Save filter
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save current filter</DialogTitle>
            <DialogDescription>
              Give this filter a name so you can reuse it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="filter-name">Filter name</Label>
            <Input
              id="filter-name"
              placeholder="e.g. My high-priority tasks"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!filterName.trim() || createFilter.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage filters */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <BookmarkIcon className="size-3.5" />
            {activeFilterName ?? "Saved filters"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Saved filters</DialogTitle>
            <DialogDescription>
              {activeFilterName
                ? `Currently applied: ${activeFilterName}`
                : "Select a filter to apply or manage your saved filters."}
            </DialogDescription>
          </DialogHeader>

          {activeFilterName && (
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { onClearFilter(); setOpen(false); }}>
              <CheckIcon className="mr-2 size-3.5" />
              Clear filter — show all tasks
            </Button>
          )}

          <div className="space-y-1">
            {isLoading ? (
              <div className="space-y-2 py-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !savedFilters?.length ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No saved filters yet. Use the &quot;Save filter&quot; button to create one.
              </p>
            ) : (
              savedFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted"
                >
                  {renameId === filter.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        value={renameName}
                        onChange={(e) => setRenameName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(filter.id);
                          if (e.key === "Escape") setRenameId(null);
                        }}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => handleRename(filter.id)}>
                        Save
                      </Button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="flex flex-1 items-center gap-2 text-left text-sm"
                        onClick={() => handleApply(filter)}
                      >
                        {filter.isDefault && (
                          <CheckIcon className="size-3.5 text-primary" />
                        )}
                        <span className={filter.isDefault ? "font-medium" : ""}>
                          {filter.name}
                        </span>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100">
                            <MoreHorizontalIcon className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleApply(filter)}>
                            Apply filter
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setRenameId(filter.id);
                              setRenameName(filter.name);
                            }}
                          >
                            <PencilIcon className="mr-2 size-3.5" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSetDefault(filter.id)}>
                            <CheckIcon className="mr-2 size-3.5" />
                            {filter.isDefault ? "Remove default" : "Set as default"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(filter.id)}
                          >
                            <Trash2Icon className="mr-2 size-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
