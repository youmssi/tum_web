"use client";

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  GanttChartIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { useBaselineVariance, useBaselines, useCaptureBaseline } from "./use-baselines";

interface BaselineVarianceDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BaselineVarianceDialog({
  projectId,
  open,
  onOpenChange,
}: BaselineVarianceDialogProps) {
  const [capturing, setCapturing] = useState(false);
  const [baselineName, setBaselineName] = useState("");
  const [baselineDesc, setBaselineDesc] = useState("");
  const [selectedBaselineId, setSelectedBaselineId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "variance">("list");

  const { data: baselines, isLoading } = useBaselines(projectId);
  const captureBaseline = useCaptureBaseline(projectId);
  const { data: varianceReport } = useBaselineVariance(selectedBaselineId ?? undefined);

  function reset() {
    setCapturing(false);
    setBaselineName("");
    setBaselineDesc("");
    setSelectedBaselineId(null);
    setView("list");
  }

  async function handleCapture() {
    if (!baselineName.trim()) {
      toast.error("Please enter a baseline name.");
      return;
    }
    setCapturing(true);
    try {
      await captureBaseline.mutateAsync({
        name: baselineName.trim(),
        description: baselineDesc.trim() || null,
      });
      setBaselineName("");
      setBaselineDesc("");
      toast.success("Baseline captured successfully!");
    } catch {
      toast.error("Failed to capture baseline.");
    } finally {
      setCapturing(false);
    }
  }

  function selectBaseline(id: string) {
    setSelectedBaselineId(id);
    setView("variance");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        {view === "list" && (
          <>
            <DialogHeader>
              <DialogTitle>Project baselines</DialogTitle>
              <DialogDescription>
                Capture a schedule snapshot to compare planned vs actual dates.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 flex-1 overflow-hidden flex flex-col">
              {/* Capture new baseline */}
              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <ZapIcon className="size-4 text-muted-foreground" />
                  Capture current schedule
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="baseline-name">Name</Label>
                  <Input
                    id="baseline-name"
                    placeholder="e.g. Sprint 1 baseline"
                    value={baselineName}
                    onChange={(e) => setBaselineName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseline-desc">Description (optional)</Label>
                  <Textarea
                    id="baseline-desc"
                    placeholder="What does this baseline represent?"
                    value={baselineDesc}
                    onChange={(e) => setBaselineDesc(e.target.value)}
                    rows={2}
                  />
                </div>
                <Button
                  onClick={handleCapture}
                  disabled={capturing || !baselineName.trim()}
                  size="sm"
                >
                  {capturing ? "Capturing…" : "Capture baseline"}
                </Button>
              </div>

              {/* Baseline list */}
              <div className="flex-1 min-h-0">
                <h3 className="text-sm font-medium mb-2">Saved baselines</h3>
                {isLoading ? (
                  <div className="text-sm text-muted-foreground py-4 text-center">Loading…</div>
                ) : baselines && baselines.length > 0 ? (
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {baselines.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => selectBaseline(b.id)}
                          className="w-full text-left rounded-lg border p-3 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{b.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {b.tasks.length} tasks
                            </Badge>
                          </div>
                          {b.description && (
                            <p className="text-xs text-muted-foreground mt-1">{b.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </p>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <Empty className="border-none py-4">
                    <EmptyHeader>
                      <EmptyTitle>No baselines yet</EmptyTitle>
                      <EmptyDescription>
                        Capture the current schedule to start tracking variance.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </div>
            </div>
          </>
        )}

        {view === "variance" && varianceReport && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GanttChartIcon className="size-4" />
                Variance — {varianceReport.baseline.name}
              </DialogTitle>
              <DialogDescription>
                Comparing current task schedules against the baseline captured on{" "}
                {new Date(varianceReport.baseline.createdAt).toLocaleDateString()}.
              </DialogDescription>
            </DialogHeader>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3 py-2">
              <div className="rounded-lg border p-3 text-center bg-green-50 dark:bg-green-950/20">
                <CheckCircle2Icon className="size-5 mx-auto mb-1 text-green-600 dark:text-green-400" />
                <p className="text-lg font-bold">{varianceReport.tasksOnSchedule}</p>
                <p className="text-xs text-muted-foreground">On schedule</p>
              </div>
              <div className="rounded-lg border p-3 text-center bg-blue-50 dark:bg-blue-950/20">
                <TrendingUpIcon className="size-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                <p className="text-lg font-bold">{varianceReport.tasksAhead}</p>
                <p className="text-xs text-muted-foreground">Ahead</p>
              </div>
              <div className="rounded-lg border p-3 text-center bg-red-50 dark:bg-red-950/20">
                <TrendingDownIcon className="size-5 mx-auto mb-1 text-red-600 dark:text-red-400" />
                <p className="text-lg font-bold">{varianceReport.tasksBehind}</p>
                <p className="text-xs text-muted-foreground">Behind</p>
              </div>
            </div>

            {/* Variance table */}
            <ScrollArea className="flex-1 min-h-0 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Baseline</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {varianceReport.variances.map((v) => {
                    const behindBehind = v.endVarianceDays != null && v.endVarianceDays > 0;
                    const ahead = v.endVarianceDays != null && v.endVarianceDays < 0;
                    return (
                      <TableRow key={v.taskId}>
                        <TableCell className="font-medium max-w-[160px] truncate">
                          {v.title}
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {v.baselineStart || "—"} → {v.baselineEnd || "—"}
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {v.currentStart || "—"} → {v.currentEnd || "—"}
                        </TableCell>
                        <TableCell>
                          {behindBehind ? (
                            <Badge
                              variant="outline"
                              className="text-xs border-red-300 text-red-600 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950/30"
                            >
                              <AlertCircleIcon className="size-3 mr-1" />+{v.endVarianceDays}d
                            </Badge>
                          ) : ahead ? (
                            <Badge
                              variant="outline"
                              className="text-xs border-green-300 text-green-600 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-950/30"
                            >
                              <CheckCircle2Icon className="size-3 mr-1" />
                              {v.endVarianceDays}d
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              <ClockIcon className="size-3 mr-1" />
                              On track
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex justify-start gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setView("list")}>
                ← Back to baselines
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
