import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PROJECT_KEYS } from "@/components/modules/projects/use-projects";
import { type ImportProjectPayload, importApi } from "./import-api";

export function useImportProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ImportProjectPayload) => importApi.importProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
    },
  });
}
