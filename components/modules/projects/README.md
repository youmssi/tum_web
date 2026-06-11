# Projects module

Project listing, cards, detail view, settings (status columns, custom fields, calendar), and import/export.

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `ProjectList` | Component | Grid of project cards with archive toggle |
| `ProjectCard` | Component | Individual project card |
| `ProjectDetail` | Component | Tabs for overview/list/board/timeline/workload/activity |
| `ProjectSettingsForm` | Component | Full settings page with all sub-cards |
| `CreateProjectDialog` | Component | Dialog to create a project |
| `StatusSettingsCard` | Component | Drag-to-reorder status column config |
| `useProjects` | Hook | Fetch project list |
| `useProject` | Hook | Fetch single project by id |
| `useStatuses`, `useCreateStatus`, etc. | Hooks | Status CRUD + reorder |
| `useStatusName`, `useStatusColor` | Hooks | Resolve display name/colour |

## Key patterns

- **Empty state**: `ProjectList` uses the shadcn `Empty` component when no projects exist.
- **Settings cards**: Each settings card (`StatusSettingsCard`, `CustomFieldsSettingsCard`, `WorkingCalendarCard`) is a self-contained `Card` that can be used standalone.
