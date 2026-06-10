import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { baselineApi, type CreateBaselinePayload } from "./baseline-api";

export const BASELINE_KEYS = {
  all: (projectId: string) => ["baselines", projectId] as const,
  variance: (baselineId: string) => ["baselines", "variance", baselineId] as const,
};

export function useBaselines(projectId: string | undefined) {
  return useQuery({
    queryKey: BASELINE_KEYS.all(projectId ?? ""),
    queryFn: () => baselineApi.listForProject(projectId!),
    enabled: !!projectId,
  });
}

export function useBaselineVariance(baselineId: string | undefined) {
  return useQuery({
    queryKey: BASELINE_KEYS.variance(baselineId ?? ""),
    queryFn: () => baselineApi.variance(baselineId!),
    enabled: !!baselineId,
  });
}

export function useCaptureBaseline(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBaselinePayload) => baselineApi.capture(projectId!, data),
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: BASELINE_KEYS.all(projectId) });
      }
    },
  });
}
