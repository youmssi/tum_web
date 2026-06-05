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
  useStatuses,
  type StatusCategory,
  type TaskStatusConfig,
} from "@/components/modules/projects";
import {
  type Task,
  type TaskStatus,
  TaskDetailSheet,
  useMoveTask,
  useTasks,
} from "@/components/modules/tasks";
import { BoardColumn } from "./board-column";
import { TaskCard } from "./task-card";

const FALLBACK_CATEGORIES: StatusCategory[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

// Columns are keyed by config.id (uuid) after V24 dropped the unique(project_id, category)
// constraint — two IN_REVIEW columns would otherwise produce duplicate React keys and
// an ambiguous column-map lookup.
type ColumnMap = Record<string, string[]>;

function buildColumns(
  tasks: Task[],
  columnIds: string[],
  colIdToCategory: Map<string, string>,
): ColumnMap {
  const cols: ColumnMap = Object.fromEntries(columnIds.map((id) => [id, []] as const));
  // Build a mapping category -> first colId with that category (in sort order)
  // so tasks whose status matches a category go into its first configured column.
  const categoryToFirstColId = new Map<string, string>();
  for (const colId of columnIds) {
    const cat = colIdToCategory.get(colId)!;
    if (!categoryToFirstColId.has(cat)) categoryToFirstColId.set(cat, colId);
  }
  [...tasks]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .forEach((t) => {
      const colId = categoryToFirstColId.get(t.status);
      if (colId) cols[colId].push(t.id);
    });
  return cols;
}

export function KanbanBoard({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading: tasksLoading } = useTasks(projectId);
  const { data: configs, isLoading: statusesLoading } = useStatuses(projectId);
  const moveTask = useMoveTask(projectId);

  const [activeId, setActiveId] = useState<string | null>(null);

  const orderedConfigs: TaskStatusConfig[] = useMemo(() => {
    if (!configs) return [];
    return [...configs].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [configs]);

  // Stable column id list and lookup maps
  const { columnIds, colIdToCategory, colIdToConfig } = useMemo(() => {
    if (orderedConfigs.length) {
      const ids = orderedConfigs.map((c) => c.id);
      const catMap = new Map(orderedConfigs.map((c) => [c.id, c.category as string]));
      const cfgMap = new Map(orderedConfigs.map((c) => [c.id, c]));
      return { columnIds: ids, colIdToCategory: catMap, colIdToConfig: cfgMap };
    }
    // Fallback before server answers: use category string as synthetic id
    const ids = FALLBACK_CATEGORIES as string[];
    const catMap = new Map(FALLBACK_CATEGORIES.map((c) => [c, c]));
    const cfgMap = new Map<string, TaskStatusConfig>();
    return { columnIds: ids, colIdToCategory: catMap, colIdToConfig: cfgMap };
  }, [orderedConfigs]);

  const serverCols = useMemo(
    () => buildColumns(tasks ?? [], columnIds, colIdToCategory),
    [tasks, columnIds, colIdToCategory],
  );
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

  function findContainer(id: string): string | null {
    if (columnIds.includes(id)) return id;
    for (const colId of columnIds) {
      if (colsRef.current[colId]?.includes(id)) return colId;
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
    const fromItems = (current[fromCol] ?? []).filter((id) => id !== activeId);
    const toItems = [...(current[toCol] ?? [])];
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
      const items = [...(current[fromCol] ?? [])];
      const oldIdx = items.indexOf(activeId);
      const newIdx = items.indexOf(overId);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        finalCols = { ...current, [fromCol]: arrayMove(items, oldIdx, newIdx) };
        updateCols(finalCols);
      }
    }

    const colItems = finalCols[fromCol] ?? [];
    const idx = colItems.indexOf(activeId);
    const afterTaskId = idx > 0 ? colItems[idx - 1] : undefined;

    // The backend move API still takes the category (TaskStatus enum), not the config id.
    // Resolve the category from the column the task ended up in.
    const targetCategory = colIdToCategory.get(toCol ?? fromCol) as TaskStatus;

    try {
      await moveTask.mutateAsync({
        id: activeId,
        status: targetCategory,
        afterTaskId,
      });
      setDragCols(null);
    } catch {
      toast.error("Failed to move task.");
      setDragCols(null);
    }
  }

  const activeTask = activeId ? (taskMap[activeId] ?? null) : null;

  if (tasksLoading || statusesLoading) {
    return (
      <div className="flex gap-4">
        {FALLBACK_CATEGORIES.map((c) => (
          <div key={c} className="flex min-w-56 flex-1 flex-col gap-2">
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
          {columnIds.map((colId) => (
            <BoardColumn
              key={colId}
              status={colIdToCategory.get(colId) as TaskStatus}
              config={colIdToConfig.get(colId) ?? null}
              tasks={(cols[colId] ?? []).map((id) => taskMap[id]).filter(Boolean) as Task[]}
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
