# Week 6 — Deployment Checklist

**Version:** 1.0  
**Date:** 2026-06-11  
**Scope:** Merge `develop` → `main` · Deploy to staging · Monitor · Deploy to production  

---

## 0. Pre-deployment Prerequisites

### Branch Status
```powershell
cd web
git branch                     # Should be: develop
git log --oneline -1           # Last commit should include the bugs-qa-week6 merge

cd app
git branch                     # Should be: develop
git log --oneline -1           # Last commit should include the bugs-qa-week6 merge
```

### Environment Variables
- [ ] `web/.env.local` — All env vars present (see `.env.example`)
- [ ] `app/.env.local` — All env vars present (DATABASE_URL, MAIL_HOST/PORT, etc.)
- [ ] `INTERNAL_SERVICE_TOKEN` matches between web and app
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` set (if OAuth needed)
- [ ] `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` set (if OAuth needed)

### Infrastructure
```powershell
cd infra\compose
docker compose ps
# Expected: postgres (healthy), minio (healthy), mailpit (healthy)
```

---

## 1. Quality Gate (Pre-merge)

### Frontend
```powershell
cd web
pnpm lint                 # Must pass with 0 errors
pnpm typecheck            # Must pass with 0 errors
pnpm vitest run           # All tests pass
pnpm build                # Must succeed
```

### Backend
```powershell
cd app
.\gradlew.bat compileJava     # Must succeed
.\gradlew.bat test            # All 147 tests pass (may take 5+ min)
```

### QA Regression (Manual)
- [ ] Auth: Signup, Login, Profile, Delete account
- [ ] OAuth: Google & GitHub on both login + signup
- [ ] Organization: Create, Invite member, Accept invitation, Settings, Delete
- [ ] Projects: Create, List, Settings (save disabled until dirty)
- [ ] Tasks: CRUD, Bulk actions, Filters, Sort, Delete with undo
- [ ] Board: Kanban rendering, Drag-drop between columns
- [ ] Timeline: Gantt rendering, Drag bars, Critical path toggle, Baselines
- [ ] Status settings: Add/reorder/WIP limits
- [ ] Custom fields: Create, Set values on tasks
- [ ] Comments: Post, Edit, Delete, @mentions, @team, @assignees
- [ ] Checklist: Add items, Check/uncheck, Delete
- [ ] Calendar: Working days, Add/delete holidays
- [ ] Notification center + preferences
- [ ] Email: Verification email via signup, Invitation email
- [ ] Empty states: All modules show proper empty/loading states
- [ ] Error states: Stop backend → verify toast + error boundaries

---

## 2. Staging Deployment

### Merge `develop` → `main`
```powershell
cd web
git checkout main
git pull origin main
git merge develop --no-ff
git push origin main

cd app
git checkout main
git pull origin main
git merge develop --no-ff
git push origin main
```

### Deploy Staging
1. Deploy `app` (Spring Boot) to staging host
2. Deploy `web` (Next.js) to staging host
3. Run Flyway migrations automatically on app startup

### Staging Verification
- [ ] All 19 controllers respond (check a sample endpoint from each)
- [ ] Auth flow works end-to-end (signup → email → login)
- [ ] Email templates render correctly in mailpit/staging email
- [ ] WebSocket real-time updates work
- [ ] File uploads (MinIO/S3) work
- [ ] Import/Export flow works
- [ ] Billing page loads (even if unconfigured)
- [ ] Error logging captures the workload/holiday 500 details (if they occur)
- [ ] Mobile/responsive views render without layout issues

### Staging Monitoring (24h)
- [ ] No unexpected 500 errors in backend logs
- [ ] No client-side errors in Sentry/browser console
- [ ] Email delivery working (transactional + notifications)
- [ ] Performance: Page load < 2s, API responses < 500ms

---

## 3. Production Deployment

### Pre-production Checklist
- [ ] Staging monitored for 24h without issues
- [ ] Database backup taken
- [ ] Deployment window confirmed (low-traffic period)
- [ ] Rollback plan reviewed (see Section 5)
- [ ] Communication sent to team/users

### Deploy Production
1. Tag release:
   ```powershell
   cd web && git tag v1.0.0 && git push origin v1.0.0
   cd app && git tag v1.0.0 && git push origin v1.0.0
   ```
2. Deploy `app` (ensure Flyway migrations run)
3. Deploy `web` (ensure env vars are set in production host)

### Post-deployment Verification
- [ ] Health endpoint: `GET /actuator/health` → `{"status":"UP"}`
- [ ] Homepage loads (200 OK)
- [ ] Auth: signup, login, OAuth all work
- [ ] Core flows: create project → create task → view timeline
- [ ] Critical user paths for first 30 min

### Production Monitoring (48h)
- [ ] Monitor error rates (< 0.1% of requests)
- [ ] Monitor API response times (< 500ms p95)
- [ ] Monitor database connection pool
- [ ] Monitor email delivery success rate
- [ ] Watch for workload/calendar 500 errors in logs

---

## 4. Rollback Procedure

### If Critical Issue Found in Staging
```powershell
# Re-deploy the previous release tag/image
git checkout <previous-tag>
# Deploy, verify, investigate root cause
```

### If Critical Issue Found in Production (First 1h)
```powershell
# Preferred: Re-deploy previous release image/tag
# This is safer than reverting individual commits
# Run rollback migration if schema changed
```

### Data Rollback (if migration needs reversing)
- Flyway migrations are versioned. To revert:
  1. Deploy the previous app version
  2. Flyway will detect the migration mismatch
  3. Manually create a `V<next>__undo_<description>.sql` migration to reverse the schema change
  4. Run `./gradlew flywayMigrate` to apply the undo migration

---

## 5. Rollback Trigger Criteria

Roll back immediately if any of the following occur within 48h of deployment:

| Severity | Criteria |
|----------|----------|
| **Critical** | Auth broken (any user cannot login/signup) |
| **Critical** | Data loss (tasks, projects disappearing) |
| **Critical** | 500 errors on >1% of requests |
| **Major** | Email delivery completely broken |
| **Major** | Gantt/timeline not loading for >5% of projects |
| **Major** | WebSocket real-time updates not working |
| **Minor** | Individual module errors (handle with hotfix) |

---

## 6. Post-Deployment Tasks

- [ ] Update status in roadmap document (`docs/tum-roadmap.md`)
- [ ] Archive the `week-4-5-refactoring` branch
- [ ] Archive the `bugs-qa-week6` branch
- [ ] Create release notes from `CHANGELOG.md`
- [ ] Schedule retrospective (Day 5 of Week 6)
- [ ] Plan Phase 6 (Views & Reporting — E26-E31) kickoff

---

## 7. Deployment Runbook

### If Backend Fails to Start
```powershell
# Check logs
cd app
.\gradlew.bat bootRun 2>&1 | findstr ERROR

# Common issues:
# 1. Database not running → docker compose up -d postgres
# 2. Migration failed → check flyway_schema_history table
# 3. Port conflict → change SERVER_PORT in .env.local
# 4. Missing env vars → check .env.local has all required vars
```

### If Frontend Fails to Build
```powershell
# Check build output
cd web
pnpm build 2>&1 | findstr error

# Common issues:
# 1. TypeScript errors → run pnpm typecheck
# 2. Missing dependencies → pnpm install
# 3. ESLint errors → pnpm lint --fix
```

### If Email Not Sending
```powershell
# Check mailpit
curl http://localhost:8025/api/v1/messages

# Check backend email logs (after the fix with new templates)
# Verify templates exist:
dir app\src\main\resources\templates\email\
# Expected: verify-email.html, org-invitation.html
```
