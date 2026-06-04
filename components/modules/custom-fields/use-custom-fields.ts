"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type CreateFieldPayload,
  type CustomFieldDefinition,
  type UpdateFieldPayload,
  customFieldApi,
} from "./custom-field-api";

export const CUSTOM_FIELD_KEYS = {
  definitions: (projectId: string) => ["custom-fields", "definitions", projectId] as const,
  values: (taskId: string) => ["custom-fields", "values", taskId] as const,
  bulkValues: (taskIds: string[]) => ["custom-fields", "bulk-values", ...taskIds] as const,
};

/** Loads the custom field definitions for a project. */
export function useCustomFieldDefinitions(projectId: string | undefined) {
  return useQuery<CustomFieldDefinition[]>({
    queryKey: CUSTOM_FIELD_KEYS.definitions(projectId ?? ""),
    queryFn: () => customFieldApi.listDefinitions(projectId!),
    enabled: !!projectId,
    staleTime: 60_000,
  });
}

/** Loads custom field values for a single task. */
export function useCustomFieldValues(taskId: string | undefined) {
  return useQuery<Record<string, string>>({
    queryKey: CUSTOM_FIELD_KEYS.values(taskId ?? ""),
    queryFn: () => customFieldApi.getValuesForTask(taskId!),
    enabled: !!taskId,
    staleTime: 30_000,
  });
}

/** Loads bulk custom field values for multiple tasks. */
export function useBulkCustomFieldValues(taskIds: string[]) {
  return useQuery<Record<string, Record<string, string>>>({
    queryKey: CUSTOM_FIELD_KEYS.bulkValues(taskIds),
    queryFn: () => customFieldApi.getBulkValues(taskIds),
    enabled: taskIds.length > 0,
    staleTime: 30_000,
  });
}

/** Creates a new custom field definition. */
export function useCreateCustomField(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFieldPayload) => customFieldApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOM_FIELD_KEYS.definitions(projectId) });
    },
  });
}

/** Updates a custom field definition. */
export function useUpdateCustomField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fieldId, data }: { fieldId: string; data: UpdateFieldPayload }) =>
      customFieldApi.update(fieldId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom-fields", "definitions"] });
    },
  });
}

/** Deletes a custom field definition and all its values. */
export function useDeleteCustomField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fieldId: string) => customFieldApi.remove(fieldId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom-fields", "definitions"] });
    },
  });
}

/** Sets a value for a task+field. */
export function useSetCustomFieldValue(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fieldId, value }: { fieldId: string; value: string | null }) =>
      customFieldApi.setValue(taskId, fieldId, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOM_FIELD_KEYS.values(taskId) });
      qc.invalidateQueries({ queryKey: ["custom-fields", "bulk-values"] });
    },
  });
}
