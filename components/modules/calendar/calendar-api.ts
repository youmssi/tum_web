import { api } from "@/lib/api-client";

// ── Existing working-calendar API (E24) ──

export interface HolidayEntry {
  date: string;
  name: string | null;
}

export interface CalendarConfig {
  workingDays: string;
  holidays: HolidayEntry[];
}

export interface UpdateCalendarPayload {
  workingDays: string;
  holidays: HolidayEntry[];
}

export const calendarApi = {
  getConfig: (projectId: string) =>
    api.get(`api/projects/${projectId}/calendar`).json<CalendarConfig>(),

  updateConfig: (projectId: string, data: UpdateCalendarPayload) =>
    api.put(`api/projects/${projectId}/calendar`, { json: data }).json<CalendarConfig>(),
};

// ── Task calendar view API (E27) ──

export const taskCalendarApi = {
  reschedule: (id: string, data: { dueDate?: string | null; startDate?: string | null; endDate?: string | null }) =>
    api.patch(`api/tasks/${id}/schedule`, { json: data }).json(),
};
