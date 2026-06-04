"use client";

import { CalendarDaysIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCalendarConfig, useUpdateCalendar } from "./use-calendar";

const DAY_NAMES: { value: number; label: string; short: string }[] = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 7, label: "Sunday", short: "Sun" },
];

interface WorkingCalendarCardProps {
  projectId: string;
}

export function WorkingCalendarCard({ projectId }: WorkingCalendarCardProps) {
  const { data: config, isLoading } = useCalendarConfig(projectId);
  const updateCalendar = useUpdateCalendar(projectId);

  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");

  function getWorkingDaysSet(): Set<number> {
    if (!config?.workingDays) return new Set([1, 2, 3, 4, 5]);
    return new Set(
      config.workingDays
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n)),
    );
  }

  async function toggleDay(day: number) {
    if (!config) return;
    const current = getWorkingDaysSet();
    if (current.has(day)) {
      current.delete(day);
    } else {
      current.add(day);
    }
    const workingDays = Array.from(current)
      .sort((a, b) => a - b)
      .join(",");
    try {
      await updateCalendar.mutateAsync({ workingDays, holidays: config.holidays ?? [] });
    } catch {
      toast.error("Failed to update working days.");
    }
  }

  async function addHoliday() {
    if (!holidayDate || !config) {
      toast.error("Please select a date.");
      return;
    }
    const holidays = [...(config.holidays ?? [])];
    const exists = holidays.some((h) => h.date === holidayDate);
    if (exists) {
      toast.error("This date is already a holiday.");
      return;
    }
    holidays.push({ date: holidayDate, name: holidayName.trim() || null });
    try {
      await updateCalendar.mutateAsync({ workingDays: config.workingDays, holidays });
      setHolidayDate("");
      setHolidayName("");
      toast.success("Holiday added.");
    } catch {
      toast.error("Failed to add holiday.");
    }
  }

  async function removeHoliday(date: string) {
    if (!config) return;
    const holidays = (config.holidays ?? []).filter((h) => h.date !== date);
    try {
      await updateCalendar.mutateAsync({ workingDays: config.workingDays, holidays });
      toast.success("Holiday removed.");
    } catch {
      toast.error("Failed to remove holiday.");
    }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDaysIcon className="size-4 text-muted-foreground" />
          Working calendar
        </CardTitle>
        <CardDescription>
          Configure which days of the week are working days and add project-specific holidays. The
          scheduling engine skips non-working days when computing dates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <>
            {/* Day-of-week toggles */}
            <div>
              <p className="text-sm font-medium mb-2">Working days</p>
              <div className="flex flex-wrap gap-1.5">
                {DAY_NAMES.map(({ value, label, short }) => {
                  const active = getWorkingDaysSet().has(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleDay(value)}
                      disabled={updateCalendar.isPending}
                      className={`inline-flex h-9 w-12 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                      title={label}
                    >
                      {short}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Toggle days to set working schedule. Non-working days are skipped by the scheduler.
              </p>
            </div>

            <Separator />

            {/* Holidays list */}
            <div>
              <p className="text-sm font-medium mb-2">Holidays ({config?.holidays?.length ?? 0})</p>
              {config?.holidays && config.holidays.length > 0 ? (
                <div className="space-y-1.5 mb-3">
                  {config.holidays.map((h) => (
                    <div
                      key={h.date}
                      className="flex items-center justify-between rounded-md border px-3 py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{h.date}</span>
                        {h.name && <span className="text-xs text-muted-foreground">{h.name}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeHoliday(h.date)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Remove holiday ${h.date}`}
                      >
                        <Trash2Icon className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mb-3">No holidays defined yet.</p>
              )}

              {/* Add holiday form */}
              <div className="flex items-end gap-2">
                <div className="space-y-1 flex-1">
                  <label className="text-xs text-muted-foreground">Date</label>
                  <Input
                    type="date"
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-xs text-muted-foreground">Name (optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g. Christmas"
                    value={holidayName}
                    onChange={(e) => setHolidayName(e.target.value)}
                    className="h-9"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9"
                  onClick={addHoliday}
                  disabled={!holidayDate || updateCalendar.isPending}
                >
                  <PlusIcon className="size-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
