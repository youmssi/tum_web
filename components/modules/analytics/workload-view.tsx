"use client";

import { AlertTriangleIcon, CheckCircle2Icon, Loader2Icon, UserIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import { useDirectory } from "@/components/modules/organization";
import { useWorkload } from "./use-workload";

function weekLabel(weekStart: string): string {
  const d = new Date(weekStart);
  const month = d.toLocaleDateString(undefined, { month: "short" });
  const day = d.getDate();
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  const endDay = end.getDate();
  return `${month} ${day}–${endDay}`;
}

interface WorkloadViewProps {
  projectId: string;
}

export function WorkloadView({ projectId }: WorkloadViewProps) {
  const { data: workload, isLoading } = useWorkload(projectId);
  const { data: directory } = useDirectory();
  const memberName = (id: string) =>
    directory?.find((m) => m.userId === id)?.name ?? id.slice(0, 8);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null);

  const dialogAssignee = useMemo(() => {
    if (!selectedAssignee || !selectedWeekStart || !workload) return null;
    const assignee = workload.assignees.find((a) => a.assigneeId === selectedAssignee);
    if (!assignee) return null;
    const week = assignee.weekly.find((w) => w.weekStart === selectedWeekStart);
    return week ?? null;
  }, [selectedAssignee, selectedWeekStart, workload]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2Icon className="size-4 animate-spin" />
            Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!workload || workload.assignees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workload</CardTitle>
          <CardDescription>No assigned tasks with dates to show.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const weeks = workload.assignees[0]?.weekly ?? [];
  const maxCount = Math.max(
    ...workload.assignees.flatMap((a) => a.weekly.map((w) => w.taskCount)),
    workload.capacityPerWeek + 1,
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="size-4 text-muted-foreground" />
            Team workload
          </CardTitle>
          <CardDescription>
            Tasks per person per week · capacity: {workload.capacityPerWeek}/week
            {workload.assignees.some((a) => a.overallocated) && (
              <Badge variant="destructive" className="ml-2 text-xs">
                <AlertTriangleIcon className="size-3 mr-1" />
                Overallocation detected
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-card text-left text-xs font-medium text-muted-foreground py-1.5 pr-3 min-w-[120px]">
                    Assignee
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-1.5 px-2 w-12">
                    Total
                  </th>
                  {weeks.map((w) => (
                    <th
                      key={w.weekStart}
                      className="text-center text-xs font-medium text-muted-foreground py-1.5 px-1 min-w-[56px]"
                    >
                      {weekLabel(w.weekStart)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workload.assignees.map((assignee) => {
                  return (
                    <tr key={assignee.assigneeId} className="group">
                      <td className="sticky left-0 bg-card py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                            {memberName(assignee.assigneeId).charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium truncate max-w-[100px]">
                            {memberName(assignee.assigneeId)}
                          </span>
                          {assignee.overallocated && (
                            <AlertTriangleIcon className="size-3.5 shrink-0 text-destructive" />
                          )}
                          {!assignee.overallocated && assignee.totalTasks > 0 && (
                            <CheckCircle2Icon className="size-3.5 shrink-0 text-green-500" />
                          )}
                        </div>
                      </td>
                      <td className="text-right py-2 px-2 tabular-nums">
                        <span
                          className={`font-medium ${
                            assignee.overallocated ? "text-destructive" : ""
                          }`}
                        >
                          {assignee.totalTasks}
                        </span>
                      </td>
                      {assignee.weekly.map((week) => {
                        const pct = maxCount > 0 ? (week.taskCount / maxCount) * 100 : 0;
                        const overloaded = week.taskCount > workload.capacityPerWeek;
                        return (
                          <td key={week.weekStart} className="py-2 px-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAssignee(assignee.assigneeId);
                                setSelectedWeekStart(week.weekStart);
                              }}
                              disabled={week.taskCount === 0}
                              className="group/bar relative flex h-full w-full cursor-pointer flex-col items-center"
                            >
                              {week.taskCount > 0 && (
                                <span className="text-[10px] tabular-nums text-muted-foreground mb-0.5">
                                  {week.taskCount}
                                </span>
                              )}
                              <div className="h-5 w-full rounded-sm bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-sm transition-all ${
                                    overloaded ? "bg-destructive/70" : "bg-primary/60"
                                  }`}
                                  style={{ width: `${Math.max(pct, 8)}%` }}
                                />
                              </div>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {/* Capacity reference row */}
                <tr className="border-t border-dashed">
                  <td className="sticky left-0 bg-card py-2 pr-3">
                    <span className="text-xs text-muted-foreground">Capacity</span>
                  </td>
                  <td />
                  {weeks.map((w) => (
                    <td key={w.weekStart} className="py-2 px-1">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] tabular-nums text-muted-foreground mb-0.5">
                          {workload.capacityPerWeek}
                        </span>
                        <div className="h-5 w-full rounded-sm border border-dashed border-muted-foreground/30" />
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Task detail dialog */}
      <Dialog
        open={!!dialogAssignee}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAssignee(null);
            setSelectedWeekStart(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="size-4" />
              {selectedAssignee ? memberName(selectedAssignee) : ""}
            </DialogTitle>
            <DialogDescription>
              Tasks for the week of {selectedWeekStart ? weekLabel(selectedWeekStart) : ""}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-60">
            <div className="space-y-1.5">
              {dialogAssignee?.taskTitles.length ? (
                dialogAssignee.taskTitles.map((title, i) => (
                  <div key={i} className="rounded-md border px-3 py-2 text-sm">
                    {title}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No tasks this week.
                </p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
