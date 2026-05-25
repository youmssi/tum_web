"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import {
  type Task,
  type TaskStatus,
  TaskDetailSheet,
  useMoveTask,
  useTasks,
} from "@/components/modules/tasks";
import { BoardColumn } from "./board-column";
import { TaskCard } from "./task-card";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

type ColumnMap = Record<TaskStatus, string[]>;

function buildColumns(tasks: Task[]): ColumnMap {
  const cols: ColumnMap = { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] };
  [...tasks]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .forEach((t) => {
      cols[t.status].push(t.id);
    });
  return cols;
}

export function KanbanBoard({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const moveTask = useMoveTask(projectId);

  const [activeId, setActiveId] = useState<string | null>(null);

  // Derive column layout from server data; keep drag mutations in separate state
  // so server refreshes never clobber an in-progress drag.
  const serverCols = useMemo(() => buildColumns(tasks ?? []), [tasks]);
  const [dragCols, setDragCols] = useState<ColumnMap | null>(null);
  const cols = activeId ? (dragCols ?? serverCols) : serverCols;
  const colsRef = useRef<ColumnMap>(cols);
  useLayoutEffect(() => {
    colsRef.current = cols;
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const updateCols = (next: ColumnMap) => {
    colsRef.current = next;
    setDragCols(next);
  };

  const taskMap = useMemo(() => Object.fromEntries((tasks ?? []).map((t) => [t.id, t])), [tasks]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function findContainer(id: string): TaskStatus | null {
    if ((STATUSES as string[]).includes(id)) return id as TaskStatus;
    for (const s of STATUSES) {
      if (colsRef.current[s].includes(id)) return s;
    }
    return null;
  }

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const fromCol = findContainer(activeId);
    const toCol = findContainer(overId);
    if (!fromCol || !toCol || fromCol === toCol) return;

    const current = colsRef.current;
    const fromItems = current[fromCol].filter((id) => id !== activeId);
    const toItems = [...current[toCol]];
    const overIndex = toItems.indexOf(overId);
    const insertAt = overIndex >= 0 ? overIndex : toItems.length;

    updateCols({
      ...current,
      [fromCol]: fromItems,
      [toCol]: [...toItems.slice(0, insertAt), activeId, ...toItems.slice(insertAt)],
    });
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) {
      setDragCols(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const current = colsRef.current;
    const fromCol = findContainer(activeId);
    const toCol = findContainer(overId);

    if (!fromCol) {
      setDragCols(null);
      return;
    }

    let finalCols = current;

    if (fromCol === toCol && activeId !== overId) {
      const items = [...current[fromCol]];
      const oldIdx = items.indexOf(activeId);
      const newIdx = items.indexOf(overId);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        finalCols = { ...current, [fromCol]: arrayMove(items, oldIdx, newIdx) };
        updateCols(finalCols);
      }
    }

    const colItems = finalCols[fromCol];
    const idx = colItems.indexOf(activeId);
    const afterTaskId = idx > 0 ? colItems[idx - 1] : undefined;

    try {
      await moveTask.mutateAsync({ id: activeId, status: fromCol, afterTaskId });
      setDragCols(null);
    } catch {
      toast.error("Failed to move task.");
      setDragCols(null);
    }
  }

  const activeTask = activeId ? (taskMap[activeId] ?? null) : null;

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {STATUSES.map((s) => (
          <div key={s} className="flex min-w-56 flex-1 flex-col gap-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-0.5">
          {STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={cols[status].map((id) => taskMap[id]).filter(Boolean) as Task[]}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setSheetOpen(true);
              }}
            />
          ))}
        </div>
        <DragOverlay>{activeTask && <TaskCard task={activeTask} isOverlay />}</DragOverlay>
      </DndContext>

      <TaskDetailSheet
        task={selectedTask}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        projectId={projectId}
      />
    </>
  );
}
