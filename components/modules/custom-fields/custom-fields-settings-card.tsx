"use client";

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
import { useForm, Controller, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { CustomFieldType } from "./custom-field-api";
import {
  useCreateCustomField,
  useCustomFieldDefinitions,
  useDeleteCustomField,
  useUpdateCustomField,
} from "./use-custom-fields";

const FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  TEXT: "Text",
  NUMBER: "Number",
  SINGLE_SELECT: "Single select",
  DATE: "Date",
};

const createFieldSchema = z.object({
  name: z.string().min(1, "Field name is required.").max(100),
  fieldType: z.enum(["TEXT", "NUMBER", "SINGLE_SELECT", "DATE"]),
  options: z.string().optional(),
});

type CreateFieldFormValues = z.infer<typeof createFieldSchema>;

interface CustomFieldsSettingsCardProps {
  projectId: string;
}

export function CustomFieldsSettingsCard({ projectId }: CustomFieldsSettingsCardProps) {
  const { data: fields, isLoading } = useCustomFieldDefinitions(projectId);
  const deleteField = useDeleteCustomField();
  const updateField = useUpdateCustomField();
  const [createOpen, setCreateOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !fields) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(fields, oldIndex, newIndex);
    const entries = reordered.map((f, i) => ({ id: f.id, sortOrder: (i + 1) * 65536 }));

    try {
      await Promise.all(
        entries.map(({ id, sortOrder }) =>
          updateField.mutateAsync({ fieldId: id, data: { sortOrder } }),
        ),
      );
    } catch {
      toast.error("Failed to reorder fields.");
    }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Custom fields</CardTitle>
        <CardDescription>
          Add custom fields to tasks in this project. Each field can be a text, number,
          single-select, or date value.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !fields || fields.length === 0 ? (
          <p className="mb-4 text-sm text-muted-foreground">
            No custom fields yet. Add one to start collecting extra data on tasks.
          </p>
        ) : (
          <div className="mb-4 space-y-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field) => (
                  <SortableFieldRow
                    key={field.id}
                    field={field}
                    onDelete={() =>
                      deleteField
                        .mutateAsync(field.id)
                        .then(() => toast.success("Field deleted."))
                        .catch(() => toast.error("Failed to delete field."))
                    }
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusIcon className="mr-1 size-4" />
              Add field
            </Button>
          </DialogTrigger>
          <CreateFieldDialog projectId={projectId} onClose={() => setCreateOpen(false)} />
        </Dialog>
      </CardContent>
    </Card>
  );
}

function SortableFieldRow({
  field,
  onDelete,
}: {
  field: {
    id: string;
    name: string;
    fieldType: CustomFieldType;
    options: string[] | null;
    sortOrder: number;
  };
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center justify-between rounded-md border px-3 py-2 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        type="button"
        className="mr-2 cursor-grab touch-none text-muted-foreground hover:text-foreground"
        aria-label={`Drag to reorder ${field.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{field.name}</p>
        <p className="text-xs text-muted-foreground">
          {FIELD_TYPE_LABELS[field.fieldType]}
          {field.options && field.options.length > 0 && ` · ${field.options.length} options`}
        </p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2Icon className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{field.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the field and all its values across every task. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CreateFieldDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const createField = useCreateCustomField(projectId);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateFieldFormValues>({
    resolver: zodResolver(createFieldSchema),
    defaultValues: { name: "", fieldType: "TEXT", options: "" },
  });

  const fieldType = useWatch({ control, name: "fieldType" });

  async function onSubmit(data: CreateFieldFormValues) {
    try {
      await createField.mutateAsync({
        name: data.name.trim(),
        fieldType: data.fieldType,
        options:
          data.fieldType === "SINGLE_SELECT"
            ? (data.options ?? "")
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
      });
      toast.success("Field created.");
      onClose();
    } catch {
      setError("root", { message: "Failed to create field." });
    }
  }

  return (
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>Add custom field</DialogTitle>
        <DialogDescription>
          Define a new field that appears on every task in this project.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup className="gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="cf-name">Field name</FieldLabel>
                <Input
                  {...field}
                  id="cf-name"
                  placeholder="e.g. Sprint number"
                  maxLength={100}
                  autoFocus
                />
                {errors.name && <FieldError errors={[errors.name]} />}
              </Field>
            )}
          />
          <Controller
            name="fieldType"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="cf-type">Type</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="cf-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(FIELD_TYPE_LABELS) as CustomFieldType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {FIELD_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          {fieldType === "SINGLE_SELECT" && (
            <Controller
              name="options"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="cf-options">Options (one per line)</FieldLabel>
                  <Textarea
                    {...field}
                    id="cf-options"
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows={4}
                  />
                </Field>
              )}
            />
          )}
        </FieldGroup>
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <DialogFooter>
          <Button type="submit" disabled={createField.isPending || isSubmitting}>
            {createField.isPending ? "Creating…" : "Create field"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
