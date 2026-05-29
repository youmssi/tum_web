"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDownIcon, CircleIcon, LayoutListIcon, Trash2Icon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDirectory } from "@/components/modules/organization";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "./task-api";
import { TaskDetailSheet } from "./task-detail-sheet";
import { CreateTaskDialog } from "./create-task-dialog";
import { useBulkUpdateTasks, useTasks } from "./use-tasks";

const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "text-muted-foreground",
  IN_PROGRESS: "text-blue-500",
  IN_REVIEW: "text-yellow-500",
  DONE: "text-green-500",
};

const PRIORITY_VARIANTS: Record<TaskPriority, "default" | "secondary" | "destructive" | "outline"> =
  {
    LOW: "secondary",
    MEDIUM: "outline",
    HIGH: "default",
    URGENT: "destructive",
  };

function MemberName({ userId }: { userId: string | null }) {
  const { data: directory } = useDirectory();
  if (!userId) return <span className="text-muted-foreground">—</span>;
  const member = directory?.find((m) => m.userId === userId);
  // Directory hasn't loaded yet (transient, ~1 render) or the assignee is no longer in the org —
  // render a human label either way rather than leaking the raw user id into the cell.
  if (!member) return <span className="text-muted-foreground">…</span>;
  return <span>{member.name}</span>;
}

function BulkActionsBar({
  count,
  pending,
  onStatusChange,
  onAssigneeChange,
  onDelete,
  onClear,
}: {
  count: number;
  pending: boolean;
  onStatusChange: (status: string) => void;
  onAssigneeChange: (value: string) => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  const t = useTranslations("tasks.list");
  const status = useTranslations("tasks.status");
  const { data: directory } = useDirectory();
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 px-4 py-2">
      <span className="text-sm font-medium">{t("selectedSummary", { count })}</span>

      <Select onValueChange={onStatusChange} disabled={pending}>
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue placeholder={t("setStatus")} />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
              {status(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={onAssigneeChange} disabled={pending || !directory}>
        <SelectTrigger className="h-8 w-40 text-xs">
          <SelectValue placeholder={t("assignTo")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__unassigned__" className="text-xs">
            Unassigned
          </SelectItem>
          {(directory ?? []).map((m) => (
            <SelectItem key={m.userId} value={m.userId} className="text-xs">
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        size="sm"
        variant="destructive"
        className="h-8 text-xs"
        onClick={onDelete}
        disabled={pending}
      >
        <Trash2Icon className="mr-1 size-3" />
        {t("bulkDelete")}
      </Button>

      <Button size="icon" variant="ghost" className="ml-auto size-8" onClick={onClear}>
        <XIcon className="size-4" />
      </Button>
    </div>
  );
}

export function TaskList({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const bulkUpdate = useBulkUpdateTasks(projectId);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">("ALL");

  const filtered = useMemo(
    () =>
      (tasks ?? []).filter((t) => {
        if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
        if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
        return true;
      }),
    [tasks, statusFilter, priorityFilter],
  );

  const selectedIds = Object.entries(rowSelection)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        size: 40,
      },
      {
        id: "status",
        header: "",
        cell: ({ row }) => (
          <CircleIcon
            className={`size-4 ${STATUS_COLORS[row.original.status]}`}
            aria-label={STATUS_LABELS[row.original.status]}
          />
        ),
        size: 32,
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDownIcon className="size-3 text-muted-foreground" />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium line-clamp-1">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">{STATUS_LABELS[row.original.status]}</p>
          </div>
        ),
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Priority
            <ArrowUpDownIcon className="size-3 text-muted-foreground" />
          </button>
        ),
        cell: ({ row }) => (
          <Badge variant={PRIORITY_VARIANTS[row.original.priority]} className="text-xs">
            {PRIORITY_LABELS[row.original.priority]}
          </Badge>
        ),
        size: 100,
      },
      {
        accessorKey: "assigneeId",
        header: "Assignee",
        cell: ({ row }) => <MemberName userId={row.original.assigneeId} />,
        size: 120,
      },
      {
        accessorKey: "dueDate",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Due
            <ArrowUpDownIcon className="size-3 text-muted-foreground" />
          </button>
        ),
        cell: ({ row }) =>
          row.original.dueDate ? (
            <span className="text-sm text-muted-foreground">
              {new Date(row.original.dueDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        size: 100,
      },
      {
        accessorKey: "labels",
        header: "Labels",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.labels.map((l) => (
              <Badge key={l} variant="secondary" className="text-xs">
                {l}
              </Badge>
            ))}
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  async function handleBulkStatusChange(status: string) {
    if (!selectedIds.length) return;
    try {
      await bulkUpdate.mutateAsync({
        ids: selectedIds,
        action: "UPDATE",
        status: status as TaskStatus,
      });
      toast.success(`${selectedIds.length} task(s) updated.`);
      setRowSelection({});
    } catch {
      toast.error("Failed to update tasks.");
    }
  }

  async function handleBulkAssigneeChange(value: string) {
    if (!selectedIds.length) return;
    try {
      await bulkUpdate.mutateAsync({
        ids: selectedIds,
        action: "UPDATE",
        assigneeId: value === "__unassigned__" ? "" : value,
      });
      toast.success(`${selectedIds.length} task(s) reassigned.`);
      setRowSelection({});
    } catch {
      toast.error("Failed to reassign tasks.");
    }
  }

  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    try {
      await bulkUpdate.mutateAsync({ ids: selectedIds, action: "DELETE" });
      toast.success(`${selectedIds.length} task(s) deleted.`);
      setRowSelection({});
    } catch {
      toast.error("Failed to delete tasks.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as TaskStatus | "ALL");
              table.setPageIndex(0);
            }}
          >
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">
                All statuses
              </SelectItem>
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={priorityFilter}
            onValueChange={(v) => {
              setPriorityFilter(v as TaskPriority | "ALL");
              table.setPageIndex(0);
            }}
          >
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">
                All priorities
              </SelectItem>
              {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                <SelectItem key={p} value={p} className="text-xs">
                  {PRIORITY_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CreateTaskDialog projectId={projectId} />
      </div>

      {selectedIds.length > 0 && (
        <BulkActionsBar
          count={selectedIds.length}
          pending={bulkUpdate.isPending}
          onStatusChange={handleBulkStatusChange}
          onAssigneeChange={handleBulkAssigneeChange}
          onDelete={handleBulkDelete}
          onClear={() => setRowSelection({})}
        />
      )}

      {filtered.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
          <LayoutListIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {tasks?.length === 0
              ? "No tasks yet. Create the first one."
              : "No tasks match the current filters."}
          </p>
          {tasks?.length === 0 && <CreateTaskDialog projectId={projectId} />}
        </div>
      ) : (
        <>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead
                        key={h.id}
                        style={{
                          width: h.column.getSize() !== 150 ? h.column.getSize() : undefined,
                        }}
                        className={
                          h.column.id === "assigneeId"
                            ? "hidden sm:table-cell"
                            : h.column.id === "dueDate"
                              ? "hidden md:table-cell"
                              : h.column.id === "labels"
                                ? "hidden lg:table-cell"
                                : ""
                        }
                      >
                        {h.isPlaceholder
                          ? null
                          : flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTask(row.original);
                      setSheetOpen(true);
                    }}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={
                          cell.column.id === "assigneeId"
                            ? "hidden sm:table-cell text-sm"
                            : cell.column.id === "dueDate"
                              ? "hidden md:table-cell text-sm"
                              : cell.column.id === "labels"
                                ? "hidden lg:table-cell"
                                : ""
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filtered.length > 0
                ? `Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()} · ${filtered.length} task${filtered.length !== 1 ? "s" : ""}`
                : "0 tasks"}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <TaskDetailSheet
        task={selectedTask}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        projectId={projectId}
      />
    </div>
  );
}
