"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCreateStatus, useDeleteStatus, useStatuses, useUpdateStatus } from "./use-statuses";
import type { StatusCategory, TaskStatusConfig } from "./status-api";

interface StatusSettingsCardProps {
  projectId: string;
}

const CATEGORY_LABEL: Record<StatusCategory, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

const CATEGORY_LIST: StatusCategory[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

const DEFAULT_COLORS: Record<StatusCategory, string> = {
  TODO: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  IN_REVIEW: "#eab308",
  DONE: "#22c55e",
};

/**
 * Inline editor for the project's configured status columns (TUM-E17). Each row owns its own
 * local name/colour/WIP state so the input doesn't jitter while the user types; we persist on blur
 * (name / WIP) or change (colour). Supports adding new statuses and deleting existing ones.
 */
export function StatusSettingsCard({ projectId }: StatusSettingsCardProps) {
  const { data: statuses, isLoading } = useStatuses(projectId);
  const updateStatus = useUpdateStatus(projectId);
  const createStatus = useCreateStatus(projectId);
  const deleteStatus = useDeleteStatus(projectId);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Status columns</CardTitle>
        <CardDescription>
          Rename the board columns, change their colours, set work-in-progress limits, and add or
          remove columns. The underlying category never changes — analytics still treat
          &ldquo;Done&rdquo; as completion.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !statuses || statuses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No status columns yet — they&rsquo;ll be seeded automatically the first time you load
            the board.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="hidden grid-cols-[2fr_1fr_auto_5rem_2rem] gap-3 text-xs font-medium text-muted-foreground sm:grid">
              <span>Name</span>
              <span>Category</span>
              <span>Colour</span>
              <span>WIP limit</span>
              <span />
            </div>
            {statuses.map((status) => (
              <StatusRow
                key={status.id}
                status={status}
                onUpdate={(payload) =>
                  updateStatus.mutateAsync({ id: status.id, payload }).catch((err) => {
                    const message = err instanceof Error ? err.message : "Failed to save status.";
                    toast.error(message);
                    throw err;
                  })
                }
                onDelete={() =>
                  deleteStatus.mutateAsync(status.id).then(() => {
                    toast.success(`"${status.name}" deleted.`);
                  })
                }
                canDelete={statuses.length > 1}
              />
            ))}

            <AddStatusDialog
              onAdd={async (payload) => {
                await createStatus.mutateAsync(payload);
                toast.success(`"${payload.name}" added.`);
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Status row ─────────────────────────────────────── */

interface StatusRowProps {
  status: TaskStatusConfig;
  onUpdate: (payload: {
    name?: string;
    color?: string;
    wipLimit?: { value: number | null };
  }) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  canDelete: boolean;
}

function StatusRow({ status, onUpdate, onDelete, canDelete }: StatusRowProps) {
  const [name, setName] = useState(status.name);
  const [color, setColor] = useState(status.color);
  const [wipLimit, setWipLimit] = useState<string>(status.wipLimit?.toString() ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Reset-on-prop-change pattern
  const [snapshot, setSnapshot] = useState(status);
  if (snapshot !== status) {
    setSnapshot(status);
    setName(status.name);
    setColor(status.color);
    setWipLimit(status.wipLimit?.toString() ?? "");
  }

  async function commitName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === status.name) {
      setName(status.name);
      return;
    }
    await onUpdate({ name: trimmed });
  }

  async function commitColor(next: string) {
    if (next === status.color) return;
    await onUpdate({ color: next });
  }

  async function commitWip() {
    const raw = wipLimit.trim();
    const next = raw === "" ? null : Number(raw);
    if (next !== null && (Number.isNaN(next) || next < 1)) {
      toast.error("WIP limit must be a positive number or empty.");
      setWipLimit(status.wipLimit?.toString() ?? "");
      return;
    }
    if (next === status.wipLimit) return;
    await onUpdate({ wipLimit: { value: next } });
  }

  return (
    <div className="grid grid-cols-[2fr_1fr_auto_5rem_2rem] items-center gap-3">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commitName}
        maxLength={60}
        aria-label={`Rename ${status.name}`}
      />
      <span className="text-xs text-muted-foreground">{CATEGORY_LABEL[status.category]}</span>
      <input
        type="color"
        value={color}
        onChange={(e) => {
          setColor(e.target.value);
          commitColor(e.target.value);
        }}
        className="h-9 w-12 cursor-pointer rounded-md border px-1 py-1"
        aria-label={`Colour for ${status.name}`}
      />
      <Input
        value={wipLimit}
        onChange={(e) => setWipLimit(e.target.value)}
        onBlur={commitWip}
        placeholder="∞"
        inputMode="numeric"
        aria-label={`WIP limit for ${status.name}`}
      />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={!canDelete}
                aria-label={`Delete ${status.name}`}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">Delete status</TooltipContent>
        </Tooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{status.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the column from the board. Existing tasks in this status will keep their
              current status category and fall back to the default display name. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await onDelete();
                setDeleteOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ── Add status dialog ──────────────────────────────── */

interface AddStatusDialogProps {
  onAdd: (payload: {
    name: string;
    color: string;
    category: StatusCategory;
    wipLimit?: number | null;
  }) => Promise<unknown>;
}

const DEFAULT_COLOR = "#6366f1";

function AddStatusDialog({ onAdd }: AddStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<StatusCategory>("TODO");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [wipLimit, setWipLimit] = useState("");

  function reset() {
    setName("");
    setCategory("TODO");
    setColor(DEFAULT_COLOR);
    setWipLimit("");
  }

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Status name is required.");
      return;
    }

    const parsedWip = wipLimit.trim() === "" ? undefined : Number(wipLimit.trim());
    if (parsedWip !== undefined && (Number.isNaN(parsedWip) || parsedWip < 1)) {
      toast.error("WIP limit must be a positive number or empty.");
      return;
    }

    try {
      await onAdd({ name: trimmed, color, category, wipLimit: parsedWip ?? null });
      setOpen(false);
      reset();
    } catch {
      toast.error("Failed to create status.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-2 w-full gap-1.5">
          <PlusIcon className="size-4" />
          Add status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add status column</DialogTitle>
          <DialogDescription>
            Create a new column for the board. Choose a name, colour, and category that determines
            how it behaves in analytics.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="add-status-name">Name</Label>
            <Input
              id="add-status-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Blocked, In QA, Needs review"
              maxLength={60}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-status-category">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v as StatusCategory);
                setColor(DEFAULT_COLORS[v as StatusCategory] ?? DEFAULT_COLOR);
              }}
            >
              <SelectTrigger id="add-status-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_LIST.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: DEFAULT_COLORS[cat] }}
                      />
                      {CATEGORY_LABEL[cat]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The category determines how the column behaves in reports and analytics. Tasks in this
              column will have the category as their underlying status.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-status-color">Colour</Label>
              <input
                id="add-status-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-14 cursor-pointer rounded-md border px-1 py-1"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="add-status-wip">WIP limit (optional)</Label>
              <Input
                id="add-status-wip"
                value={wipLimit}
                onChange={(e) => setWipLimit(e.target.value)}
                placeholder="∞"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add column</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
