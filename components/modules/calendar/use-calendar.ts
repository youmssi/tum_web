import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { calendarApi, type UpdateCalendarPayload } from "./calendar-api";

export const CALENDAR_KEYS = {
  config: (projectId: string) => ["calendar", projectId] as const,
};

export function useCalendarConfig(projectId: string | undefined) {
  return useQuery({
    queryKey: CALENDAR_KEYS.config(projectId ?? ""),
    queryFn: () => calendarApi.getConfig(projectId!),
    enabled: !!projectId,
  });
}

export function useUpdateCalendar(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCalendarPayload) => calendarApi.updateConfig(projectId!, data),
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.config(projectId) });
      }
    },
  });
}
