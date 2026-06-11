# Custom Fields module

Dynamic field definitions per project and field value display per task.

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `CustomFieldsSettingsCard` | Component | Drag-to-reorder field definitions with type/name/options editor |
| `CustomFieldValues` | Component | Inline display + editing of field values on a task |

## Key patterns

- **Drag reorder**: Uses `@dnd-kit` `DndContext` + `SortableContext` for field ordering, same pattern as `StatusSettingsCard`.
- **Field types**: Supports text, number, date, select, multi-select. Select types store options as JSON in the definition.
- **Pessimistic creates**: The "add field" dialog and "save" flow use `useMutation` with `onSuccess` invalidation (no optimistic update — field values render importance justifies waiting for the server).
