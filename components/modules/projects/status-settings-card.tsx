"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useStatuses, useUpdateStatus } from "./use-statuses";
import type { TaskStatusConfig } from "./status-api";

interface StatusSettingsCardProps {
  projectId: string;
}

const CATEGORY_LABEL: Record<TaskStatusConfig["category"], string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

/**
 * Inline editor for the project's configured status columns (TUM-E17). Each row owns its own
 * local name/colour/WIP state so the input doesn't jitter while the user types; we persist on blur
 * (name / WIP) or change (colour, since the colour picker only fires once the user closes it).
 * The category is read-only — it's the invariant analytics rely on ("DONE means completion").
 */
export function StatusSettingsCard({ projectId }: StatusSettingsCardProps) {
  const { data: statuses, isLoading } = useStatuses(projectId);
  const updateStatus = useUpdateStatus(projectId);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Status columns</CardTitle>
        <CardDescription>
          Rename the board columns, change their colours, and set work-in-progress limits. The
          underlying category never changes — analytics still treat &ldquo;Done&rdquo; as
          completion.
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
            <div className="hidden grid-cols-[2fr_1fr_auto_5rem] gap-3 text-xs font-medium text-muted-foreground sm:grid">
              <span>Name</span>
              <span>Category</span>
              <span>Colour</span>
              <span>WIP limit</span>
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
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatusRowProps {
  status: TaskStatusConfig;
  onUpdate: (payload: {
    name?: string;
    color?: string;
    wipLimit?: { value: number | null };
  }) => Promise<unknown>;
}

function StatusRow({ status, onUpdate }: StatusRowProps) {
  const [name, setName] = useState(status.name);
  const [color, setColor] = useState(status.color);
  // Stored as a string so the empty state ("no limit") is representable distinct from "0".
  const [wipLimit, setWipLimit] = useState<string>(status.wipLimit?.toString() ?? "");
  // Reset-on-prop-change pattern (React docs: "Adjusting state during render"). When the parent
  // query refetches after a successful save, snapshotting the new prop and calling setState during
  // render lets React skip the intermediate paint without a useEffect.
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
    <div className="grid grid-cols-[2fr_1fr_auto_5rem] items-center gap-3">
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
    </div>
  );
}
