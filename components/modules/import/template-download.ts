export const AI_IMPORT_PROMPT = `You are an AI assistant that converts project descriptions into structured CSV files for Tûm, a modern project management platform.

Generate a CSV using the exact column format below. The file will be uploaded to create a complete project with tasks, dependencies, subtasks, milestones, and schedules.

=== CSV FORMAT ===
project_name,project_description,title,description,parent_task,start_date,end_date,status,priority,progress,milestone,depends_on,labels,due_date,assignee

=== COLUMN RULES ===
1. First data row: fill project_name and project_description; leave these EMPTY on all subsequent rows.
2. title (required): unique task name within the file.
3. parent_task: exact title of the parent task for subtask relationships; leave empty for top-level tasks.
4. start_date / end_date: use YYYY-MM-DD (e.g. 2026-06-01). Estimate if exact dates aren't known.
5. status: one of TODO, IN_PROGRESS, IN_REVIEW, DONE — leave empty for default (TODO).
6. priority: one of LOW, MEDIUM, HIGH, URGENT — leave empty for default (MEDIUM).
7. progress: integer 0–100 — leave empty or use 0.
8. milestone: TRUE or FALSE — set TRUE for milestone tasks (diamond marker on timeline).
9. depends_on: comma-separated titles of tasks this task depends on (creates dependency arrows on the Gantt chart).
   If multiple: wrap in quotes, e.g. "Planning phase,Research".
10. labels: comma-separated tags or categories, e.g. "design,frontend,urgent".
11. due_date: YYYY-MM-DD deadline (distinct from the task's scheduling end_date).
12. assignee: name or email of the person responsible.

=== VIEWS SUPPORTED BY TÛM ===
- Kanban board: columns are statuses with drag-and-drop cards
- Gantt timeline: bars show start/end dates, dependency arrows, milestone diamonds, progress fill
- List view: sortable/filterable table with bulk actions
- Workload view: per-assignee task distribution across weeks
- Dashboard: completion trends, status breakdowns, overdue tracking

=== EXAMPLE OUTPUT ===
project_name,project_description,title,description,parent_task,start_date,end_date,status,priority,progress,milestone,depends_on,labels,due_date,assignee
Website Redesign,Complete website overhaul,Discovery,,,2026-06-01,2026-06-14,TODO,HIGH,0,FALSE,,research,2026-06-07,Alice
,,User interviews,Conduct 5 user interviews,Discovery,2026-06-01,2026-06-07,TODO,HIGH,0,FALSE,,,2026-06-05,Bob
,,Competitor analysis,Review top 3 competitors,Discovery,2026-06-01,2026-06-10,TODO,MEDIUM,0,FALSE,,"research,planning",2026-06-08,
,,Design system,,,2026-06-15,2026-07-15,TODO,HIGH,0,TRUE,Discovery,design,,Alice
,,Wireframes,Low-fidelity wireframes,Design system,2026-06-15,2026-06-28,TODO,MEDIUM,0,FALSE,"User interviews,Competitor analysis","design,ux",,Bob

=== MY PROJECT ===
[PASTE YOUR PROJECT DESCRIPTION, GANTT CHART, TASK LIST, OR NOTES HERE]`;

export async function downloadTemplate(): Promise<void> {
  const xlsx = await import("xlsx");

  const headers = [
    "project_name",
    "project_description",
    "title",
    "description",
    "parent_task",
    "start_date",
    "end_date",
    "status",
    "priority",
    "progress",
    "milestone",
    "depends_on",
    "labels",
    "due_date",
    "assignee",
  ];

  const example1 = [
    "Website Redesign",
    "Complete website overhaul",
    "Discovery",
    "",
    "",
    "2026-06-01",
    "2026-06-14",
    "TODO",
    "HIGH",
    "0",
    "FALSE",
    "",
    "research",
    "2026-06-07",
    "Alice",
  ];
  const example2 = [
    "",
    "",
    "User interviews",
    "Conduct 5 user interviews",
    "Discovery",
    "2026-06-01",
    "2026-06-07",
    "TODO",
    "HIGH",
    "0",
    "FALSE",
    "",
    "",
    "2026-06-05",
    "Bob",
  ];
  const example3 = [
    "",
    "",
    "Competitor analysis",
    "Review top 3 competitors",
    "Discovery",
    "2026-06-01",
    "2026-06-10",
    "TODO",
    "MEDIUM",
    "0",
    "FALSE",
    "",
    "research,planning",
    "2026-06-08",
    "",
  ];
  const example4 = [
    "",
    "",
    "Design system",
    "",
    "",
    "2026-06-15",
    "2026-07-15",
    "TODO",
    "HIGH",
    "0",
    "TRUE",
    "Discovery",
    "design",
    "",
    "Alice",
  ];
  const example5 = [
    "",
    "",
    "Wireframes",
    "Low-fidelity wireframes",
    "Design system",
    "2026-06-15",
    "2026-06-28",
    "TODO",
    "MEDIUM",
    "0",
    "FALSE",
    "User interviews,Competitor analysis",
    "design,ux",
    "",
    "Bob",
  ];

  const hints = [
    "# Required on first row only",
    "# Optional project description",
    "# Required, unique title",
    "# Optional details",
    "# Parent task title (for subtasks)",
    "# YYYY-MM-DD",
    "# YYYY-MM-DD",
    "# TODO|IN_PROGRESS|IN_REVIEW|DONE",
    "# LOW|MEDIUM|HIGH|URGENT",
    "# 0-100",
    "# TRUE|FALSE",
    "# Comma-sep task titles",
    "# Comma-sep labels/tags",
    "# YYYY-MM-DD deadline",
    "# Assignee name or email",
  ];

  const wsData = [headers, hints, example1, example2, example3, example4, example5];

  const ws = xlsx.utils.aoa_to_sheet(wsData);
  ws["!cols"] = headers.map(() => ({ wch: 22 }));

  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Import Template");

  const promptWs = xlsx.utils.aoa_to_sheet(AI_IMPORT_PROMPT.split("\n").map((line) => [line]));
  promptWs["!cols"] = [{ wch: 100 }];
  xlsx.utils.book_append_sheet(wb, promptWs, "AI Prompt");

  xlsx.writeFile(wb, "tum-import-template.xlsx");
}
