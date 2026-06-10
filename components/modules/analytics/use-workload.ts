import { useQuery } from "@tanstack/react-query";

import { workloadApi } from "./workload-api";

export const WORKLOAD_KEYS = {
  data: (projectId: string) => ["workload", projectId] as const,
};

export function useWorkload(projectId: string | undefined) {
  return useQuery({
    queryKey: WORKLOAD_KEYS.data(projectId ?? ""),
    queryFn: () => workloadApi.get(projectId!),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}
