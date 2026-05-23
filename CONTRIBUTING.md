# Contributing to Tûm — web

## Prerequisites

- Node 22, pnpm 9+
- Copy `.env.example` → `.env.local` and fill in values

## Setup

```bash
pnpm install
pnpm dev
```

## Workflow

1. Pick a story from the backlog (`docs/tum-backlog-mvp.md`).
2. Create a branch: `TUM-<STORY-ID>-<short-description>` (lowercase, hyphens).
3. Implement the story following the conventions in `AGENTS.md`.
4. Run the quality gate:

   ```bash
   pnpm lint && pnpm typecheck && pnpm test && pnpm build
   ```

5. Open a PR using the template; map each acceptance criterion to a test or screenshot.

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add task assignee selector (TUM-E03-01)
fix: correct date overflow in gantt view (TUM-E05-02)
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. Max header length: 120 characters.

## Code conventions

- **`page.tsx` is a thin shell** — feature logic lives in `components/modules/<domain>/`.
- **Server Components by default**; add `"use client"` only when needed.
- **Always use shadcn/ui** — check `components/ui/` before building from scratch.
- **All forms use React Hook Form + Zod** (`zodResolver`).
- **Environment variables** only in `lib/env.ts` or `lib/env.server.ts` — never `process.env` elsewhere.
- **Routes and shared keys** only in `lib/constants.ts`.

## CI

The GitHub Actions pipeline runs lint → typecheck → test → build on every push and PR. Images are published to GHCR on merges to `main`.
