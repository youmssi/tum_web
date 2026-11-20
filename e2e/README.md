# End-to-end tests

Playwright drives a real browser through the main flows against a full local stack. Only the
payment provider is stubbed (in the browser), since a real Dexpay payment cannot run unattended.

| Spec              | Covers                                                                         |
| ----------------- | ------------------------------------------------------------------------------ |
| `core-flows.spec` | Sign-up, workspace creation, project creation, task creation, list & board     |
| `checkout.spec`   | Pricing → first payment (phone only) → Dexpay hand-off, refusal, failed return |

## Run locally

1. Postgres: `docker compose up -d postgres` in the infra repo.
2. Backend (app repo), in cloud mode like production:
   `TUM_CLOUD_ENABLED=true INTERNAL_SERVICE_TOKEN=e2e-internal-token ./gradlew bootRun`
3. Web (this repo), with `.env.local` pointing at them (`INTERNAL_SERVICE_TOKEN=e2e-internal-token`):
   `pnpm db:migrate && pnpm build && pnpm start` (or the standalone server).
4. `pnpm test:e2e`

Set `E2E_BASE_URL` to run against another address. Each test signs up its own user; Better Auth
allows three sign-ups per ten seconds from one address, and the fixture waits that window out.

## In CI

The `End-to-end` job in `.github/workflows/ci.yml` runs on pull requests to `main` and on demand.
It pulls the backend image `ghcr.io/youmssi/tum_app:staging`, which is private: grant this
repository read access in the package settings (Package settings → Manage Actions access → add
`tum_web`), then set the repository variable `E2E_ENABLED` to `true`.
