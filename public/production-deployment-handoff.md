# Production Deployment Handoff — v1.0.0

**Prepared:** 2026-06-11  
**From:** Week 6 Deployment Lead  
**To:** Ops / Production Team  

---

## ✅ Pre-Flight Summary

| Item | Status | Notes |
|------|--------|-------|
| PR #45 (web) | ✅ Merged → main | `4a4b0e4` |
| PR #33 (app) | ✅ Merged → main | `511dbd6` |
| Frontend quality gate | ✅ Passed | lint, typecheck, 15 tests, build |
| Backend quality gate | ✅ Passed | compile, 147 tests |
| Staging deployed | ✅ Running | localhost:3000 + :8080 |
| Staging verified | ✅ Passed | Health UP, JWKS OK, browser smoke test OK |
| Release tag | ✅ v1.0.0 | Pushed to both repos |
| Release notes | ✅ Published | https://github.com/youmssi/tum_web/releases/tag/v1.0.0 |
| Staging monitoring | ✅ Configured | `monitoring/staging-monitor.sh` (24h cycle) |

---

## Production Infrastructure Requirements

This deployment **cannot be completed from the local environment**.  
You need a production hosting provider. The stack requires:

| Service | Recommended | Alternative |
|---------|-------------|-------------|
| **Next.js Frontend** | Railway / Vercel / Fly.io | Docker + any container host |
| **Spring Boot Backend** | Railway / Fly.io / ECS | Docker + any container host |
| **PostgreSQL** | Neon / Supabase | RDS / Cloud SQL |
| **S3 Storage** | Cloudflare R2 / AWS S3 | MinIO self-hosted |
| **SMTP (Transactional Email)** | Resend / Postmark | AWS SES |

---

## Deployment Steps (Production)

### 1. Database Setup
1. Provision PostgreSQL (Neon, Supabase, RDS — whichever you choose)
2. Set `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` in production env
3. Flyway migrations run automatically on app startup — no manual SQL needed

### 2. Backend (Spring Boot) Deploy
```bash
# From the app repo on main@511dbd6 or tag v1.0.0
# Build the JAR
./gradlew.bat bootJar

# Set required env vars:
export DATABASE_URL=jdbc:postgresql://<host>:5432/tum
export DATABASE_USERNAME=<user>
export DATABASE_PASSWORD=<pw>
export AUTH_JWKS_URI=https://<frontend-url>/api/auth/jwks
export CORS_ALLOWED_ORIGINS=https://<frontend-url>
export MINIO_ENDPOINT=<s3-endpoint>
export MINIO_ACCESS_KEY=<key>
export MINIO_SECRET_KEY=<secret>
export MAIL_HOST=smtp.resend.com
export MAIL_PORT=465
export MAIL_USERNAME=<smtp-username>
export MAIL_PASSWORD=<smtp-password>
export INTERNAL_SERVICE_TOKEN=<shared-secret>

# Run
java -jar build/libs/tum-app-*.jar
```

### 3. Frontend (Next.js) Deploy
```bash
# From the web repo on main@4a4b0e4 or tag v1.0.0
# Build
pnpm build

# Set required env vars:
export BETTER_AUTH_URL=https://<frontend-url>
export BETTER_AUTH_SECRET=<secret>
export DATABASE_URL=postgresql://<user>:<pw>@<host>/tum?ssl=true
export NEXT_PUBLIC_API_BASE_URL=https://<backend-url>
export INTERNAL_API_URL=https://<backend-url>
export INTERNAL_SERVICE_TOKEN=<shared-secret>
# OAuth (optional):
export GOOGLE_CLIENT_ID=<id>
export GOOGLE_CLIENT_SECRET=<secret>
export GITHUB_CLIENT_ID=<id>
export GITHUB_CLIENT_SECRET=<secret>

# Start
pnpm start
```

---

## Post-Deployment Verification

Once both services are deployed and DNS resolves:

```bash
# Health check
curl -f https://<backend-url>/actuator/health
# Expected: {"status":"UP"}

# Homepage
curl -f https://<frontend-url>
# Expected: 200 OK

# Auth check
curl -f https://<frontend-url>/api/auth/jwks
# Expected: 200 + JSON with keys array
```

---

## Rollback Plan

| Scenario | Action |
|----------|--------|
| Auth broken | Re-deploy previous version (tag `v0.x.x`) |
| 500s >1% requests | Re-deploy previous version, revert DB migration if needed |
| Email broken | Hotfix — check SMTP credentials first |
| Data loss | Restore from DB backup, re-deploy previous version |

---

## Monitoring (First 48h)

- Watch backend logs for workload/holiday 500s (error logging was added)
- Monitor error rate (< 0.1% of requests)
- Check email delivery success rate
- Monitor DB connection pool

## Rollback Triggers

See `deployment-checklist-week6.md` Section 5 for full criteria.
