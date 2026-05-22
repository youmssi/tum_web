// Ambient type declarations for `frappe-gantt` (v1.2.x ships no types of its own).
// Covers the surface Tûm uses; extend as the Gantt feature (TUM-E06) grows.
declare module "frappe-gantt" {
  export type GanttViewMode = "Quarter Day" | "Half Day" | "Day" | "Week" | "Month" | "Year";

  export interface GanttTask {
    id: string;
    name: string;
    start: string | Date;
    end: string | Date;
    progress?: number;
    dependencies?: string | string[];
    custom_class?: string;
    [key: string]: unknown;
  }

  export interface GanttOptions {
    view_mode?: GanttViewMode;
    date_format?: string;
    language?: string;
    readonly?: boolean;
    readonly_dates?: boolean;
    readonly_progress?: boolean;
    column_width?: number;
    bar_height?: number;
    padding?: number;
    popup_on?: "click" | "hover";
    today_button?: boolean;
    view_mode_select?: boolean;
    on_click?: (task: GanttTask) => void;
    on_date_change?: (task: GanttTask, start: Date, end: Date) => void;
    on_progress_change?: (task: GanttTask, progress: number) => void;
    on_view_change?: (mode: GanttViewMode) => void;
    [key: string]: unknown;
  }

  export default class Gantt {
    constructor(
      wrapper: string | HTMLElement | SVGElement,
      tasks: GanttTask[],
      options?: GanttOptions,
    );
    refresh(tasks: GanttTask[]): void;
    change_view_mode(mode: GanttViewMode): void;
    update_task(id: string, newDetails: Partial<GanttTask>): void;
  }
}
