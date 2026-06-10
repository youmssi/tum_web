import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type CreateProjectPayload,
  type UpdateProjectPayload,
  type Project,
  projectApi,
} from "./project-api";

export const PROJECT_KEYS = {
  all: ["projects"] as const,
  lists: () => ["projects", "list"] as const,
  list: (includeArchived: boolean) => ["projects", "list", includeArchived] as const,
  detail: (id: string) => ["projects", id] as const,
};

export function useProjects(includeArchived = false) {
  return useQuery({
    queryKey: PROJECT_KEYS.list(includeArchived),
    queryFn: () => projectApi.list(includeArchived),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id),
    queryFn: () => projectApi.get(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectPayload) => projectApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProjectPayload) => projectApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(PROJECT_KEYS.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
    },
  });
}

export function useToggleArchive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      archived ? projectApi.unarchive(id) : projectApi.archive(id),
    onMutate: async ({ id, archived }) => {
      await queryClient.cancelQueries({ queryKey: PROJECT_KEYS.detail(id) });
      const previous = queryClient.getQueryData<Project>(PROJECT_KEYS.detail(id));
      if (previous) {
        queryClient.setQueryData<Project>(PROJECT_KEYS.detail(id), {
          ...previous,
          archived: !archived,
        });
      }
      return { previous };
    },
    onError: (_err, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PROJECT_KEYS.detail(id), context.previous);
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: PROJECT_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
    },
  });
}
