import { api } from "@/lib/api-client";

export interface ImportTaskRow {
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  priority?: string | null;
  progress?: number | null;
  milestone?: boolean | null;
  parentTask?: string | null;
  dependsOn?: string[] | null;
}

export interface ImportProjectPayload {
  name: string;
  description?: string | null;
  tasks: ImportTaskRow[];
}

export interface ImportProjectResult {
  projectId: string;
  projectName: string;
  tasksCreated: number;
  dependenciesCreated: number;
}

export const importApi = {
  importProject: (data: ImportProjectPayload) =>
    api.post("api/projects/import", { json: data }).json<ImportProjectResult>(),
};
