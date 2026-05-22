# Feature modules

Per-domain UI + client logic lives here — one folder per business module:

```
components/modules/
  auth/
  organization/
  project/
  task/
  board/
  timeline/
  ...
```

Inside a module, colocate what that feature owns:

```
components/modules/project/
  components/   # presentational + container components
  hooks/        # TanStack Query hooks (useProjects, useCreateProject, ...)
  api/          # KY calls + request/response types for this domain
  store.ts      # Zustand store for genuine UI/client state (optional)
```

Rules of thumb:

- Routes live in `app/` and stay thin — they import from modules.
- Design-system primitives live in `components/ui/` (shadcn), not here.
- Promote a component to `components/ui/` only when it is reused across modules.
- Add shadcn components on demand: `pnpm dlx shadcn@latest add <component>` — never bulk-add.
- Create a module folder only when its story is in progress (don't pre-create empty domains).
