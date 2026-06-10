import { api } from "@/lib/api-client";

/** Mirrors the backend CustomFieldType enum. */
export type CustomFieldType = "TEXT" | "NUMBER" | "SINGLE_SELECT" | "DATE";

/** Mirrors the backend CustomFieldDefinition record. */
export interface CustomFieldDefinition {
  id: string;
  projectId: string;
  name: string;
  fieldType: CustomFieldType;
  options: string[] | null;
  sortOrder: number;
}

/** Payload for creating a new field. */
export interface CreateFieldPayload {
  name: string;
  fieldType: CustomFieldType;
  options?: string[];
}

/** Partial update payload — null fields are left unchanged. */
export interface UpdateFieldPayload {
  name?: string;
  options?: string[];
  sortOrder?: number;
}

export const customFieldApi = {
  /** List all custom field definitions for a project. */
  listDefinitions: (projectId: string) =>
    api.get(`api/projects/${projectId}/custom-fields`).json<CustomFieldDefinition[]>(),

  /** Create a new custom field definition. */
  create: (projectId: string, data: CreateFieldPayload) =>
    api
      .post(`api/projects/${projectId}/custom-fields`, { json: data })
      .json<CustomFieldDefinition>(),

  /** Update a custom field definition. */
  update: (fieldId: string, data: UpdateFieldPayload) =>
    api.patch(`api/custom-fields/${fieldId}`, { json: data }).json<CustomFieldDefinition>(),

  /** Delete a custom field definition and all its values. */
  remove: async (fieldId: string) => {
    await api.delete(`api/custom-fields/${fieldId}`);
  },

  /** Get all custom field values for a task, keyed by field id. */
  getValuesForTask: (taskId: string) =>
    api.get(`api/tasks/${taskId}/custom-values`).json<Record<string, string>>(),

  /** Get bulk values for multiple tasks, keyed by task id then field id. */
  getBulkValues: (taskIds: string[]) =>
    api
      .get("api/tasks/custom-values", { searchParams: { taskIds: taskIds.join(",") } })
      .json<Record<string, Record<string, string>>>(),

  /** Set (upsert) a value for a task+field. Passing null clears the value. */
  setValue: async (taskId: string, fieldId: string, value: string | null) => {
    await api.put(`api/tasks/${taskId}/custom-values/${fieldId}`, { json: { value } });
  },
};
