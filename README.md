# Tûm — Frontend (`web`)

> **Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui**
>
> The frontend application of Tûm — a project-execution and workflow-visibility platform. Built on the Next.js 16 App Router with React Server Components, it handles all user-facing UI, authentication (via Better Auth), and real-time updates (via STOMP over WebSocket). It communicates with the `app` Spring Boot backend over a typed REST API using KY and TanStack Query.

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Architecture](#architecture)
3. [Route map](#route-map)
4. [Environment variables](#environment-variables)
5. [Quick start (development)](#quick-start-development)
6. [Production build & Docker](#production-build--docker)
7. [Testing](#testing)
8. [Code conventions](#code-conventions)
9. [Contributing](#contributing)

---

## Tech stack

| Layer             | Technology                     | Version    |
| ----------------- | ------------------------------ | ---------- |
| Framework         | Next.js (App Router)           | 16.2.6     |
| UI runtime        | React                          | 19.2.4     |
| Language          | TypeScript                     | 5.x        |
| Styling           | Tailwind CSS                   | 4.x        |
| Component library | shadcn/ui (Radix primitives)   | latest     |
| Server state      | TanStack Query                 | 5.x        |
| HTTP client       | KY                             | 2.0.2      |
| Client state      | Zustand                        | 5.x        |
| Forms             | React Hook Form + Zod          | 7.x / 4.x  |
| Auth              | Better Auth                    | 1.6.11     |
| Real-time         | @stomp/stompjs                 | 7.3.0      |
| Drag & drop       | dnd-kit                        | 6.x / 10.x |
| Timeline / Gantt  | Frappe Gantt                   | 1.2.2      |
| Charts            | Recharts                       | 3.x        |
| Database (auth)   | PostgreSQL via `pg`            | 8.x        |
| Testing           | Vitest + React Testing Library | 4.x / 16.x |

---

## Architecture

### How the frontend fits into the system

```mermaid
graph TB
    subgraph web["web — Next.js 16 :3000"]
        direction TB
        RSC["React Server Components\n(data fetching, layouts)"]
        RCC["React Client Components\n('use client' — interactions, real-time)"]
        BA["Better Auth\n/api/auth/*"]
        PROXY["proxy.ts\n(route auth guard)"]
    end

    subgraph backend["app — Spring Boot 4 :8080"]
        REST["REST API"]
        STOMP["WebSocket / STOMP\n/ws"]
        JWKS["GET /api/auth/jwks"]
    end

    subgraph infra["infra — Docker Compose"]
        PG[("PostgreSQL 17\n:5432")]
        MN["MinIO\n:9000"]
    end

    Browser -->|HTTPS| PROXY
    PROXY -->|"authenticated routes"| RSC
    RSC -->|render| RCC
    RCC -->|"REST + Bearer JWT"| REST
    RCC <-->|"STOMP frames"| STOMP
    BA -->|"OAuth2 (Google/GitHub/email)"| Browser
    REST -->|"GET /api/auth/jwks\n(validate JWT)"| JWKS
    BA -->|"session tables"| PG
    REST -->|"presigned S3 URL"| RCC
    RCC -->|"PUT file bytes"| MN
```

### Data layer

```mermaid
graph LR
    subgraph "Client Component"
        HOOK["useQuery / useMutation\n(TanStack Query)"]
        FORM["React Hook Form + Zod"]
    end

    subgraph "lib/"
        KY["api-client.ts\n(KY instance)"]
        ENV["env.ts\nenv.server.ts"]
        CONST["constants.ts\nROUTES, AUTH_COOKIES"]
    end

    subgraph "components/modules/<domain>/"
        API["<domain>-api.ts"]
        HOOKS["use-<domain>.ts"]
        UI["<domain>-<component>.tsx"]
    end

    HOOK --> HOOKS
    HOOKS --> API
    API --> KY
    KY -->|"Bearer JWT"| Backend["app :8080"]
    FORM --> HOOKS
```

### Authentication flow

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant P as proxy.ts
    participant BA as Better Auth /api/auth
    participant A as Spring Boot :8080

    B->>P: GET /dashboard (no session)
    P->>B: 302 → /login
    B->>BA: POST /api/auth/sign-in/email
    BA->>BA: create session, set cookie
    BA->>B: 200 + Set-Cookie: session
    B->>P: GET /dashboard (with cookie)
    P->>P: session valid → pass through
    Note over B,A: On first API call from a Client Component:
    B->>BA: GET /api/auth/token
    BA->>B: { token: "eyJ…" } (short-lived JWT)
    B->>A: GET /api/projects\nAuthorization: Bearer eyJ…
    A->>BA: GET /api/auth/jwks (cached)
    A->>B: 200 [ projects ]
```

---

## Route map

**Locale-prefixed routing** — every UI route lives under `app/[locale]/`. Supported locales are `en` and `fr`; the prefix is omitted for the default locale (English) and rendered for everything else (e.g. `/fr/dashboard`). Routing is driven by `next-intl` (`i18n/routing.ts`, `i18n/navigation.ts`) and locale resolution happens in `proxy.ts`: cookie → `Accept-Language` → default. The list below shows the canonical paths; the same paths exist under each locale prefix.

| Route                        | Component                 | Notes                                                                           |
| ---------------------------- | ------------------------- | ------------------------------------------------------------------------------- |
| `/`                          | `app/[locale]/page.tsx`   | Landing page (`HeroSection`, `FeaturesSection`, `HowItWorks`, `Pricing`, `CTA`) |
| `/login`                     | `LoginForm`               | Email + Google + GitHub sign-in                                                 |
| `/signup`                    | `SignupForm`              | Email registration with verification email                                      |
| `/onboarding`                | `CreateOrgForm`           | Org creation after first sign-in                                                |
| `/workspaces`                | `WorkspacePicker`         | Pick an org or create a new one (also reachable from the sidebar switcher)      |
| `/invitations/accept`        | `AcceptInvitationView`    | Accept org invite via token                                                     |
| `/dashboard`                 | `MyWorkDashboard`         | Personal task overview + completion-trend chart                                 |
| `/projects`                  | `ProjectList`             | All projects in the active org; archived toggle; import CSV button              |
| `/projects/[id]`             | `ProjectDetail`           | Tabs: Overview, List, Board, Timeline, Activity                                 |
| `/projects/[id]/settings`    | `ProjectSettingsForm`     | Project name, description, member-restriction, delete                           |
| `/profile`                   | `ProfileForm`             | Name, avatar, sign-out                                                          |
| `/organization/members`      | `MemberList`              | Invite, role change, remove                                                     |
| `/organization/settings`     | `OrgSettingsForm`         | Org name + preferences                                                          |
| `/organization/audit`        | `AuditLog`                | Filterable audit trail (admin/owner only) + CSV export                          |
| `/notifications/preferences` | `NotificationPreferences` | Email + in-app toggles per event type                                           |

---

## Environment variables

Copy `.env.example` to `.env.local` for local development. Never commit `.env.local`.

| Variable                      | Example                                   | Description                                                           |
| ----------------------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`    | `http://localhost:8080`                   | Spring Boot base URL — used by the KY HTTP client in the browser      |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | `http://localhost:3000`                   | Better Auth base URL (must equal the app's own origin)                |
| `BETTER_AUTH_URL`             | `http://localhost:3000`                   | Same as above, server-side                                            |
| `BETTER_AUTH_SECRET`          | _(strong random string)_                  | Signs Better Auth sessions — keep secret, rotate on breach            |
| `DATABASE_URL`                | `postgresql://tum:tum@localhost:5432/tum` | PostgreSQL URL for Better Auth session storage                        |
| `INTERNAL_SERVICE_TOKEN`      | `dev-internal-token`                      | Shared secret for service-to-service calls (must match backend)       |
| `INTERNAL_API_URL`            | `http://localhost:8080`                   | Backend URL for server-side calls (route handlers, Server Components) |
| `GOOGLE_CLIENT_ID`            | _(optional)_                              | Google OAuth app client ID                                            |
| `GOOGLE_CLIENT_SECRET`        | _(optional)_                              | Google OAuth app client secret                                        |
| `GITHUB_CLIENT_ID`            | _(optional)_                              | GitHub OAuth app client ID                                            |
| `GITHUB_CLIENT_SECRET`        | _(optional)_                              | GitHub OAuth app client secret                                        |

> `NEXT_PUBLIC_*` variables are embedded in the client bundle at build time. Never put secrets in them.

---

## Quick start (development)

### Prerequisites

| Tool           | Version                       |
| -------------- | ----------------------------- |
| Node.js        | 22 LTS                        |
| pnpm           | 9.x (`npm install -g pnpm@9`) |
| Docker Desktop | 4.x+                          |

### 1. Start infrastructure

```bash
cd ../infra
cp .env.example .env
docker compose up -d
```

### 2. Install dependencies

```bash
cd ../web
pnpm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
# Set BETTER_AUTH_SECRET to a random string:
#   openssl rand -hex 32
# Leave all other values at their defaults for local dev
```

### 4. Run the dev server

```bash
pnpm dev
```

Open `http://localhost:3000`. Hot reload is enabled.

### 5. Start the backend (required for data pages)

```bash
cd ../app
./gradlew bootRun
```

Auth pages work without the backend. Data pages (dashboard, projects, tasks) require the backend on `:8080`.

### Development scripts

| Command             | Description                                       |
| ------------------- | ------------------------------------------------- |
| `pnpm dev`          | Start dev server with hot reload                  |
| `pnpm build`        | Production build (outputs to `.next/standalone/`) |
| `pnpm start`        | Serve the production build                        |
| `pnpm lint`         | Run ESLint                                        |
| `pnpm typecheck`    | Run TypeScript type checking                      |
| `pnpm test`         | Run all tests once (Vitest)                       |
| `pnpm test:watch`   | Vitest in watch mode                              |
| `pnpm format`       | Format all files with Prettier                    |
| `pnpm format:check` | Check formatting without writing                  |

---

## Production build & Docker

### Build locally

```bash
pnpm build    # next.config.ts has output: "standalone"
pnpm start
```

### Docker (standalone image)

The `Dockerfile` uses a multi-stage build: `deps → builder → runner`. The final image is minimal Node 22 Alpine with a non-root user.

```bash
# Build the image
docker build -t tum-web:latest .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.example.com \
  -e BETTER_AUTH_URL=https://app.example.com \
  -e NEXT_PUBLIC_BETTER_AUTH_URL=https://app.example.com \
  -e BETTER_AUTH_SECRET=<strong-secret> \
  -e DATABASE_URL=postgresql://tum:<pw>@db:5432/tum \
  -e INTERNAL_API_URL=http://app:8080 \
  -e INTERNAL_SERVICE_TOKEN=<token> \
  tum-web:latest
```

### CI / GHCR

The GitHub Actions pipeline (`.github/workflows/ci.yml`) runs the quality gate on every push and PR, then builds and pushes to GHCR on every merge to `main`:

```
ghcr.io/youmssi/tum_web:<git-sha>
ghcr.io/youmssi/tum_web:latest
```

---

## Testing

```bash
pnpm test          # run all tests (Vitest)
pnpm test:watch    # watch mode
```

- Tests live next to the code they cover: `*.test.ts` / `*.test.tsx`.
- Mock the KY client or `fetch` directly in tests.
- `components/ui/` is excluded from linting and testing — it is shadcn-managed code.
- Playwright E2E is intentionally deferred until there are complete end-to-end flows worth covering.

---

## Code conventions

- **`page.tsx` is a thin shell** — metadata, redirects, and a single component import. No hooks or JSX logic.
- **Feature code lives in `components/modules/<domain>/`** — one file per component, exported via `index.ts`.
- **Server Components by default** — add `"use client"` only when a component needs `useState`, `useEffect`, or browser APIs.
- **All forms use React Hook Form + Zod** — `zodResolver`, `form.setError("root", …)` for API errors.
- **Never use `process.env` outside** `lib/env.ts` (public vars) or `lib/env.server.ts` (secrets).
- **Never hardcode route strings** — use `ROUTES.*` from `lib/constants.ts`.
- **Always check `components/ui/`** before building any UI primitive from scratch.
- **`proxy.ts` is the route guard** — it is the Next.js 16 equivalent of `middleware.ts` (the `middleware` file convention is deprecated in Next.js 16). It composes `next-intl`'s locale-detection middleware with our session check.
- **Use `@/i18n/navigation` for `Link`, `useRouter`, `usePathname`, and client-side `redirect`** — never `next/link` or `next/navigation` (the locale-aware helpers keep the `/en` or `/fr` prefix on every push, replace, and link). Server-side redirects from page components use `redirectLocalized()` in `i18n/server-redirect.ts`.
- **All user-facing strings live in `messages/{en,fr}.json`** — wire them via `useTranslations(...)` (client) or `getTranslations(...)` (server). A vitest test (`messages/messages.test.ts`) enforces key parity between locales.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow: branching, Conventional Commits, quality gate, and PR template guidance. Read `../docs/tum-backlog-mvp.md` for the full story backlog.
