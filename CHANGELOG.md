# Changelog

## [Unreleased] — Refactoring Phase (Weeks 4–6)

### Added
- **Spinner component** (web): Shared `<Spinner>` component with `data-icon` attribute support, replacing raw `Loader2Icon` usage across all form submit buttons
- **Disabled states** (web): Submit buttons in profile, org settings, and project settings now stay disabled until the form is dirty (`form.formState.isDirty`)
- **OAuth signup** (web): Google and GitHub OAuth buttons added to the signup page (matching the login page)
- **Delete account** (web): `DeleteAccountCard` added to the profile page (previously only accessible via direct URL)
- **Email templates** (app): Created `verify-email.html` and `org-invitation.html` transactional email templates (were missing, causing email sending to silently fail)
- **Error logging** (app): Added SLF4J logging with try-catch on `TaskController.workload()` and `CalendarController.updateConfig()` to capture stack traces for the remaining 500 errors
- **OAuth translations** (web): Added `continueWith`, `google`, `github` keys to `auth.signup` section in both `en.json` and `fr.json`
- **Session loading guard** (web): Added `sessionPending` guard in `AcceptInvitationView` to prevent API calls during session loading

### Fixed
- **Signup t.rich error** (web): Replaced `t.rich()` (which caused "Functions are not valid as a React child") with standard `t()` string interpolation for the "Check your email" card
- **Invitation 401 for unauthenticated users** (web): `AcceptInvitationView` now checks session state before calling `getInvitation` API, showing sign-in prompt instead of a 401 error
- **Critical path DOMTokenList error** (web): Frappe Gantt `custom_class` now uses a single class name (instead of space-separated), preventing `classList.add()` failure
- **@team mention 500** (app): Added null guards on `projects.memberIds()` and `watchers.watcherIdsForTask()` in `CommentService` to prevent NPE when expanding @team mentions
- **Lint warnings** (web): Removed 6 unused import warnings across activity-feed, comparison-section, notification-center, task-detail-sheet, baseline-variance-view, and project-timeline
- **EmailTemplateRendererTest** (app): Updated test placeholder key from `verificationUrl` to `url` to match `auth.config.ts` context
- **Zod validation** (web): Added proper `FieldError` validation to AddStatusDialog
- **Field component pattern** (web): Harmonized forms with shadcn Field pattern across 7 modules
- **Empty states** (web): Standardized empty states with consistent icon + message pattern
- **Optimistic updates** (web): Added optimistic update patterns for bulk operations

### Refactored
- **API route constants** (app): Centralized all `/api/*` strings in `ApiRoutes.java` constants class; refactored 19 controllers to use constants
- **Error boundary** (web): Created page-level `<ErrorBoundary>` component wrapping the authenticated layout
- **Loading states** (web): Standardized to Skeleton loaders for primary content (cards, tables, lists)
- **Drag-reorder** (web): Standardized dnd-kit pattern for all admin lists (status columns, custom fields)
- **Spinner standardization** (web): Converted raw `Loader2Icon` usage to shared `<Spinner>` component in `export-button.tsx` and `billing-page.tsx`
- **Bulk operations** (web): Extracted dependency logic, added drag-reorder for status/custom-fields
- **WorkloadService** (app): Reverted broken early-return code that referenced non-existent methods

### Chores
- Cleaned up unused imports (web)
- Updated `.env.example` documentation (web)
- Updated module READMEs (web)
- Updated QA manual regression test plan with bug fix verification sections (docs)
- Created deployment checklist for Week 6 rollout (docs)

### Known Issues (Investigated but unresolved)
- **Workload 500 on empty project** (`GET /api/projects/{id}/workload`): Existing code handles empty tasks/members correctly; added error logging to capture stack trace on next failure
- **Holiday 500** (`PUT /api/projects/{id}/calendar`): `deleteAllInBatch` + flush + `saveAll` sequence should work; added error logging to capture stack trace on next failure
