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
}

export const dependencyApi = {
  listForTask: (taskId: string) =>
    api.get(`api/tasks/${taskId}/dependencies`).json<Dependency[]>(),

  create: (fromTaskId: string, data: { toTaskId: string; type: DependencyType }) =>
    api.post(`api/tasks/${fromTaskId}/dependencies`, { json: data }).json<Dependency>(),

  remove: async (id: string) => {
    await api.delete(`api/dependencies/${id}`);
  },
};
