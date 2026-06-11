# Tasks module

Task CRUD, list view, detail sheet, and bulk operations.

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `TaskList` | Component | Filterable/sortable data table with pagination |
| `TaskDetailSheet` | Component | Slide-over panel for task details |
| `CreateTaskDialog` | Component | Inline dialog to create a task |
| `useTasks` | Hook | Fetches and caches tasks for a project |
| `useMyTasks` | Hook | Fetches tasks assigned to the current user |
| `useMoveTask` | Hook | Drag-and-drop board → status updates |
| `useBulkUpdateTasks` | Hook | Batch status/assignee/delete |
| `useRescheduleTask` | Hook | Date changes from the timeline |
| `type Task`, `type TaskStatus`, `type TaskPriority` | Types | Core domain types |
| `STATUS_LABELS`, `PRIORITY_LABELS` | Constants | Display labels |

## Key patterns

- **Optimistic updates**: `useCreateComment`, `useUpdateComment`, `useDeleteComment` in the comments module use `onMutate` → `setQueryData` → `onSettled` → `invalidateQueries` for instant UI feedback.
- **Caching**: All queries use TanStack Query with `queryKey` constants exported from each hook file so other modules can invalidate them.
