# Analytics module

Project dashboard, My Work dashboard, and workload heatmap view.

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `ProjectDashboard` | Component | Stat cards, status breakdown bar, completion trend chart, recent activity |
| `MyWorkDashboard` | Component | Personal task stats + status-grouped task list |
| `WorkloadView` | Component | Per-assignee weekly task count heatmap with capacity ref |
| `useProjectMetrics` | Hook | Completion trend + metrics |
| `useWorkload` | Hook | Per-assignee workload data |

## Key patterns

- **Charts**: Uses `recharts` for the completion trend area chart.
- **Status-aware**: `ProjectDashboard` resolves status names/colours via `useStatusName` and `useStatusColor` so renamed statuses propagate.
- **Empty states**: All views use the shadcn `Empty` component when no data is available.
