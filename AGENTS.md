<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Tûm — web (agent & contributor guide)

This is the **frontend** repo of Tûm (project execution & workflow-visibility platform).

## Canonical docs (read before contributing)

- `../docs/tum-contribution-workflow.md` — **how to deliver a story** (branching, tests, PR, Definition of Done). Start here.
- `../docs/tum-backlog-mvp.md` — the backlog (epics, stories, acceptance criteria).
- `../docs/tum-setup-guide.md` — bootstrap reference.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui (Radix base, Nova preset) · TanStack Query (server state) · KY (HTTP) · Zustand (UI/client state) · dnd-kit (drag & drop) · Better Auth (identity authority). **Gantt/timeline = Frappe Gantt** wrapped in a local component (the shadcn.io Gantt is paid/unaffiliated — do not use it).

## Project structure (no `src/` — App Router default at root)

```
app/                      # routes (Server Components by default)
components/
  ui/                     # shadcn primitives — add on demand, never bulk-add
  modules/<domain>/       # feature modules (auth, organization, project, task, board, timeline, ...)
lib/                      # cn(), shared clients/utils
```

- Per-domain UI + logic lives in `components/modules/<domain>/` (see that folder's README). Keep route files in `app/` thin.
- Promote a component into `components/ui/` only when it is reused across modules.

## Conventions (follow Next.js best practices)

- **Server Components by default**; add `"use client"` only when a component needs state/effects/browser APIs.
- **Server state** via TanStack Query; **HTTP** via the shared KY client; **UI/client state** via Zustand. Don't put server data in Zustand.
- **Add shadcn components only when a story needs them**: `pnpm dlx shadcn@latest add <component>`. Avoid boilerplate — never `add --all`.
- TypeScript strict; every screen has loading / empty / error states.
- **`proxy.ts`** is the Next.js 16 equivalent of `middleware.ts` — export `proxy` (not `middleware`). The `middleware` file convention is deprecated.

## Page and component architecture

- **`page.tsx` is a thin shell** — import and render the feature component, handle metadata, do server-side redirects. No form logic, no hooks, no JSX beyond the component call.
- **All feature logic lives in `components/modules/<domain>/`** — one file per component, exported via `index.ts`. Example: `components/modules/auth/{login-form,signup-form,profile-form}.tsx` + `index.ts`.
- **Always use shadcn/ui** — check `components/ui/` and https://ui.shadcn.com before building anything from scratch.
- **All forms use React Hook Form + Zod** (`zodResolver`). Use `Controller` for controlled inputs, `form.setError("root", …)` for API errors, `fieldState.invalid` + `fieldState.error` for field-level errors.
- **`components/ui/` is external** — never lint, format, or test it. It is excluded in `eslint.config.mjs`, `.prettierignore`, and `vitest.config.ts`.

## Environment variables

**Never** write `process.env.ANYTHING` outside of the two env files:

| File | Scope | Contains |
|---|---|---|
| `lib/env.ts` | Client + Server | `NEXT_PUBLIC_*` vars only |
| `lib/env.server.ts` | Server only (guarded by `server-only`) | DB, secrets, OAuth keys, internal tokens |

Import `env` from `@/lib/env` in client or shared code; import `serverEnv` from `@/lib/env.server` in server-only code (`lib/auth.ts`, route handlers, Server Actions, Server Components).

## Constants

**Never hardcode route strings or shared keys inline.** All app-wide constants live in `lib/constants.ts`:

- `ROUTES` — all application routes (`ROUTES.DASHBOARD`, `ROUTES.LOGIN`, …)
- `AUTH_COOKIES` — session cookie names

Import and use them everywhere: `router.push(ROUTES.DASHBOARD)`, `href={ROUTES.LOGIN}`, `cookieStore.has(AUTH_COOKIES.SESSION)`.

## Testing (kept lean on purpose)

- **Vitest + React Testing Library** for unit/component tests: `pnpm test` (watch: `pnpm test:watch`).
- **Playwright (E2E) is intentionally deferred** until there are real end-to-end flows worth covering (added later as a dedicated story). Don't add it preemptively.
- Mock the KY client / fetch directly in tests; MSW is not set up yet (add only if mocking becomes painful).
- **`vi.mock` hoisting**: `vi.mock()` is hoisted to the top of the file. Any variable referenced **directly** (not inside a nested closure) in the factory body must be declared with `vi.hoisted()`:
  ```ts
  const { mockFn } = vi.hoisted(() => ({ mockFn: vi.fn() }));
  vi.mock("@/lib/some-module", () => ({ fn: mockFn }));
  ```
  Variables used only inside a returned function (e.g. `() => ({ push: mockPush })`) are fine as plain `const` because the closure defers access until call time.

## Commits, branches, PRs

- Branch: `TUM-<STORY-ID>-<short-description>` (lowercase, hyphens, ≤5 words).
- **Conventional Commits**: `feat: … (TUM-EXX-YY)`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- **No AI attribution anywhere.** Do NOT add `Co-Authored-By`, "Generated by", or any AI/agent trailer or mention in commit messages, PR descriptions, or code comments. **Human authors/contributors only.**

## Quality gate before opening a PR

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` — all green. Fill the PR template; map each acceptance criterion to a test.
