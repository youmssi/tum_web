"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { useRouter } from "@/i18n/navigation";

export const TASK_SEARCH_PARAM = "task";

/**
 * Opens the task named in `?task=<id>` once the task list has loaded, so links in emails land on
 * the right task. Closing the sheet drops the parameter so a refresh does not reopen it.
 */
export function useTaskDeepLink<T extends { id: string }>(
  tasks: T[] | undefined,
  open: (task: T) => void,
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get(TASK_SEARCH_PARAM);
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!taskId || !tasks || handled.current === taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    handled.current = taskId;
    open(task);
  }, [taskId, tasks, open]);

  return useCallback(() => {
    if (!searchParams.has(TASK_SEARCH_PARAM)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete(TASK_SEARCH_PARAM);
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }, [router, searchParams]);
}
