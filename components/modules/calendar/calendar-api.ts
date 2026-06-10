import { api } from "@/lib/api-client";

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
