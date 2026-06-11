"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useChecklistItems,
  useChecklistProgress,
  useCreateChecklistItem,
  useDeleteChecklistItem,
  useUpdateChecklistItem,
} from "./use-checklist";

interface ChecklistViewProps {
  taskId: string;
}

export function ChecklistView({ taskId }: ChecklistViewProps) {
  const { data: items, isLoading } = useChecklistItems(taskId);
  const { data: progress } = useChecklistProgress(taskId);
  const createItem = useCreateChecklistItem(taskId);
  const updateItem = useUpdateChecklistItem(taskId);
  const deleteItem = useDeleteChecklistItem(taskId);
  const [newText, setNewText] = useState("");

  async function handleAdd() {
    const trimmed = newText.trim();
    if (!trimmed) return;
    try {
      await createItem.mutateAsync(trimmed);
      setNewText("");
    } catch {
      toast.error("Failed to add item.");
    }
  }

  async function handleToggle(itemId: string, checked: boolean) {
    try {
      await updateItem.mutateAsync({ itemId, data: { checked } });
    } catch {
      toast.error("Failed to update item.");
    }
  }

  async function handleDelete(itemId: string) {
    try {
      await deleteItem.mutateAsync(itemId);
    } catch {
      toast.error("Failed to delete item.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">Checklist</p>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Checklist</p>
        {progress && progress.total > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {progress.checked}/{progress.total} done
          </span>
        )}
      </div>

      {items && items.length > 0 && (
        <div className="space-y-1">
          {items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              text={item.text}
              checked={item.checked}
              onToggle={(checked) => handleToggle(item.id, checked)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}

      <Field orientation="horizontal" className="gap-2">
        <FieldLabel className="sr-only">Add checklist item</FieldLabel>
        <Input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add checklist item…"
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button
          size="icon"
          variant="ghost"
          className="size-9 shrink-0"
          onClick={handleAdd}
          disabled={!newText.trim() || createItem.isPending}
        >
          <PlusIcon className="size-4" />
        </Button>
      </Field>
    </div>
  );
}

interface ChecklistItemRowProps {
  text: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  onDelete: () => void;
}

function ChecklistItemRow({ text, checked, onToggle, onDelete }: ChecklistItemRowProps) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className="group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onToggle(!!v)}
        aria-label={`Mark "${text}" as ${checked ? "incomplete" : "complete"}`}
      />
      <span
        className={cn(
          "flex-1 text-sm transition-colors",
          checked && "text-muted-foreground line-through",
        )}
      >
        {text}
      </span>
      {showDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2Icon className="size-3" />
        </Button>
      )}
    </div>
  );
}
