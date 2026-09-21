export interface BurndownPoint {
  date: string;
  remaining: number;
  ideal: number;
}

export interface BurnupPoint {
  date: string;
  scope: number;
  completed: number;
}

export interface CycleTimePoint {
  weekStart: string;
  p50: number;
  p75: number;
  p95: number;
}

export interface ThroughputPoint {
  weekStart: string;
  completed: number;
}

export interface AnalyticsResponse {
  burndown: BurndownPoint[];
  burnup: BurnupPoint[];
  cycleTime: CycleTimePoint[];
  throughput: ThroughputPoint[];
}
