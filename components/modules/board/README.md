# Board module

Kanban board with drag-and-drop task cards using `@dnd-kit`.

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `KanbanBoard` | Component | Full board with columns and drag overlay |
| `BoardColumn` | Component | Single status column with sortable cards |
| `TaskCard` | Component | Draggable task card |

## Key patterns

- **Drag state**: Uses `DragOverlay` for smooth drag feedback and optimistic column reordering via local state (`dragCols`).
- **Status config**: Columns are keyed by `config.id` (uuid) after V24 dropped the unique constraint. A `colIdToCategory` map resolves column id → category for the backend move API.
- **Fallback**: Before the status config query answers, `FALLBACK_CATEGORIES` (TODO, IN_PROGRESS, IN_REVIEW, DONE) are used as synthetic column ids.
