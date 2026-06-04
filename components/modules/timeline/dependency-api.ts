import { api } from "@/lib/api-client";

export type DependencyType =
  | "FINISH_TO_START"
  | "START_TO_START"
  | "FINISH_TO_FINISH"
  | "START_TO_FINISH";

export const DEPENDENCY_TYPE_LABELS: Record<DependencyType, string> = {
  FINISH_TO_START: "Finish → Start",
  START_TO_START: "Start → Start",
  FINISH_TO_FINISH: "Finish → Finish",
  START_TO_FINISH: "Start → Finish",
};

export interface Dependency {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: DependencyType;
  lagDays: number;
}

export interface ScheduleResult {
  updatedTasks: Task[];
  autoShiftedTasks: Task[];
  conflicts: string[];
}

// Need to avoid circular imports — just the shape we need
interface Task {
  id: string;
  startDate: string | null;
  endDate: string | null;
  title: string;
}

export const dependencyApi = {
  listForTask: (taskId: string) => api.get(`api/tasks/${taskId}/dependencies`).json<Dependency[]>(),

  listForProject: (projectId: string) =>
    api.get(`api/projects/${projectId}/dependencies`).json<Dependency[]>(),

  create: (
    fromTaskId: string,
    data: { toTaskId: string; type: DependencyType; lagDays?: number },
  ) => api.post(`api/tasks/${fromTaskId}/dependencies`, { json: data }).json<Dependency>(),

  remove: async (id: string) => {
    await api.delete(`api/dependencies/${id}`);
  },

  autoSchedule: (projectId: string) =>
    api.post(`api/projects/${projectId}/schedule`).json<ScheduleResult>(),

  reschedule: (taskId: string, data: { startDate: string | null; endDate: string | null }) =>
    api.patch(`api/tasks/${taskId}/schedule`, { json: data }).json<ScheduleResult>(),
};
