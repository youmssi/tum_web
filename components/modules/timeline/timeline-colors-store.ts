import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TimelineColorConfig {
  onTrackColor: string;
  nearDueColor: string;
  overdueColor: string;
  nearDueDays: number;
}

const DEFAULT_CONFIG: TimelineColorConfig = {
  onTrackColor: "#3b82f6",
  nearDueColor: "#f97316",
  overdueColor: "#ef4444",
  nearDueDays: 3,
};

interface TimelineColorsStore {
  configs: Record<string, TimelineColorConfig>;
  getConfig: (projectId: string) => TimelineColorConfig;
  setConfig: (projectId: string, config: TimelineColorConfig) => void;
  resetConfig: (projectId: string) => void;
}

export const useTimelineColors = create<TimelineColorsStore>()(
  persist(
    (set, get) => ({
      configs: {},
      getConfig: (projectId) => get().configs[projectId] ?? DEFAULT_CONFIG,
      setConfig: (projectId, config) =>
        set((s) => ({ configs: { ...s.configs, [projectId]: config } })),
      resetConfig: (projectId) =>
        set((s) => {
          const next = { ...s.configs };
          delete next[projectId];
          return { configs: next };
        }),
    }),
    { name: "tum-timeline-colors" },
  ),
);

export { DEFAULT_CONFIG };
