"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useCreateStatus,
  useDeleteStatus,
  useReorderStatuses,
  useStatuses,
  useUpdateStatus,
} from "./use-statuses";
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
 * Inline editor for the project's configured status columns (TUM-E17). Supports rename,
 * colour change, WIP limit, add, delete, and drag-to-reorder via dnd-kit SortableContext.
 * Reorder calls the existing PATCH /api/projects/:id/statuses/reorder endpoint.
 */
export function StatusSettingsCard({ projectId }: StatusSettingsCardProps) {
  const { data: statuses, isLoading } = useStatuses(projectId);
  const updateStatus = useUpdateStatus(projectId);
  const createStatus = useCreateStatus(projectId);
  const deleteStatus = useDeleteStatus(projectId);
  const reorderStatuses = useReorderStatuses(projectId);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !statuses) return;

    const oldIndex = statuses.findIndex((s) => s.id === active.id);
    const newIndex = statuses.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(statuses, oldIndex, newIndex);
    // Spacing matches the backend's SORT_SPACING = 65_536 constant.
    const entries = reordered.map((s, i) => ({ id: s.id, sortOrder: (i + 1) * 65536 }));
    try {
      await reorderStatuses.mutateAsync({ entries });
    } catch {
      toast.error("Failed to reorder statuses.");
    }
  }

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
            <div className="hidden grid-cols-[1.5rem_2fr_1fr_auto_5rem_2rem] gap-3 text-xs font-medium text-muted-foreground sm:grid">
              <span />
              <span>Name</span>
              <span>Category</span>
              <span>Colour</span>
              <span>WIP limit</span>
              <span />
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={statuses.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {statuses.map((status) => (
                  <StatusRow
                    key={status.id}
                    status={status}
                    onUpdate={(payload) =>
                      updateStatus.mutateAsync({ id: status.id, payload }).catch((err) => {
                        toast.error(err instanceof Error ? err.message : "Failed to save status.");
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
              </SortableContext>
            </DndContext>

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

/* ── Sortable status row ─────────────────────────────── */

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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: status.id,
  });

  const [name, setName] = useState(status.name);
  const [color, setColor] = useState(status.color);
  const [wipLimit, setWipLimit] = useState<string>(status.wipLimit?.toString() ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Reset local state when the server pushes updated props (e.g. after another client renames).
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
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`grid grid-cols-[1.5rem_2fr_1fr_auto_5rem_2rem] items-center gap-3 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>

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

const addStatusSchema = z.object({
  name: z
    .string()
    .min(1, "Status name is required.")
    .max(60, "Name must be at most 60 characters."),
  category: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
  color: z.string().min(1),
  wipLimit: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || (!Number.isNaN(Number(val)) && Number(val) >= 1),
      "WIP limit must be a positive number or empty.",
    ),
});

type AddStatusValues = z.infer<typeof addStatusSchema>;

const DEFAULT_COLOR = "#6366f1";

function AddStatusDialog({ onAdd }: AddStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<AddStatusValues>({
    resolver: zodResolver(addStatusSchema),
    defaultValues: {
      name: "",
      category: "TODO",
      color: DEFAULT_COLOR,
      wipLimit: "",
    },
  });

  function resetAndClose() {
    setOpen(false);
    form.reset({
      name: "",
      category: "TODO",
      color: DEFAULT_COLOR,
      wipLimit: "",
    });
  }

  async function onSubmit(data: AddStatusValues) {
    try {
      await onAdd({
        name: data.name.trim(),
        color: data.color,
        category: data.category,
        wipLimit: data.wipLimit && data.wipLimit.trim() !== "" ? Number(data.wipLimit) : null,
      });
      resetAndClose();
    } catch {
      toast.error("Failed to create status.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
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
        <form id="add-status-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="py-2 gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="add-status-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="add-status-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. Blocked, In QA, Needs review"
                    maxLength={60}
                    autoFocus
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="category"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="add-status-category">Category</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      // Auto-set colour when category changes
                      form.setValue(
                        "color",
                        DEFAULT_COLORS[v as StatusCategory] ?? DEFAULT_COLOR,
                      );
                    }}
                  >
                    <SelectTrigger
                      id="add-status-category"
                      aria-invalid={fieldState.invalid}
                    >
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
                  <FieldDescription>
                    The category determines how the column behaves in reports and analytics.
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <div className="flex gap-4">
              <Controller
                name="color"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="add-status-color">Colour</FieldLabel>
                    <input
                      id="add-status-color"
                      type="color"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-9 w-14 cursor-pointer rounded-md border px-1 py-1"
                    />
                  </Field>
                )}
              />
              <Controller
                name="wipLimit"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="flex-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="add-status-wip">WIP limit (optional)</FieldLabel>
                    <Input
                      {...field}
                      id="add-status-wip"
                      aria-invalid={fieldState.invalid}
                      placeholder="∞"
                      inputMode="numeric"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="ghost" type="button" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-status-form">
            Add column
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
