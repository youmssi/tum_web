# timeline (Gantt) module

Base for the Gantt/timeline feature (built out in **TUM-E06**).

## Engine: Frappe Gantt

- `gantt-chart.tsx` — the **only** place that touches `frappe-gantt`. Everything else in the app uses this `<GanttChart />` wrapper, so the engine can be themed or swapped without wider changes.
- `frappe-gantt.css` — **vendored** from `frappe-gantt@1.2.2` (MIT). It is vendored on purpose: the package's `exports` map doesn't expose the stylesheet as an importable subpath, and we intend to theme it to our design tokens. Re-sync from `node_modules/frappe-gantt/dist/frappe-gantt.css` if the dependency is upgraded.
- `types/frappe-gantt.d.ts` (repo root) — ambient types, since the package ships none.

## Usage

```tsx
import { GanttChart, type GanttTask } from "@/components/modules/timeline/gantt-chart";

const tasks: GanttTask[] = [
  { id: "1", name: "Design", start: "2026-06-01", end: "2026-06-05", progress: 40 },
  { id: "2", name: "Build", start: "2026-06-06", end: "2026-06-12", dependencies: "1" },
];

<GanttChart
  tasks={tasks}
  viewMode="Week"
  onDateChange={(t, start, end) => {
    /* persist */
  }}
/>;
```

## Notes / next steps (E06)

- Wire `onDateChange` / `onProgressChange` to the task API (optimistic updates).
- Dependency arrows come from each task's `dependencies`; cycle prevention is enforced server-side.
- Move from full re-create to instance `refresh()` / `update_task()` for cheaper updates.
- Theme `frappe-gantt.css` to the shadcn/Tailwind tokens (`--primary`, `--border`, etc.).
