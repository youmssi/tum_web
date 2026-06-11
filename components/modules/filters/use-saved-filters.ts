import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  type CreateSavedFilterPayload,
  type UpdateSavedFilterPayload,
  savedFilterApi,
} from "./saved-filter-api";

export const SAVED_FILTER_KEYS = {
  all: ["saved-filters"] as const,
  byProject: (projectId?: string) => ["saved-filters", projectId ?? "__all__"] as const,
};

export function useSavedFilters(projectId?: string) {
  return useQuery({
    queryKey: SAVED_FILTER_KEYS.byProject(projectId),
    queryFn: () => savedFilterApi.list(projectId),
  });
}

export function useCreateSavedFilter(projectId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSavedFilterPayload) =>
      savedFilterApi.create(data, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SAVED_FILTER_KEYS.byProject(projectId) });
      toast.success("Filter saved.");
    },
    onError: () => toast.error("Failed to save filter."),
  });
}

export function useUpdateSavedFilter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSavedFilterPayload }) =>
      savedFilterApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SAVED_FILTER_KEYS.all });
      toast.success("Filter updated.");
    },
    onError: () => toast.error("Failed to update filter."),
  });
}

export function useDeleteSavedFilter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => savedFilterApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SAVED_FILTER_KEYS.all });
      toast.success("Filter deleted.");
    },
    onError: () => toast.error("Failed to delete filter."),
  });
}

export function useSetDefaultFilter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => savedFilterApi.setDefault(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SAVED_FILTER_KEYS.all });
      toast.success("Default filter updated.");
    },
    onError: () => toast.error("Failed to set default filter."),
  });
}
