# Changelog

## [Unreleased] — Refactoring Phase (Weeks 4–6)

### Added
- **Spinner component**: Shared `<Spinner>` component with `data-icon` attribute support, replacing raw `Loader2Icon` usage across all form submit buttons
- **Disabled states**: Submit buttons in profile, org settings, and project settings now stay disabled until the form is dirty (`form.formState.isDirty`)
- **OAuth signup**: Google and GitHub OAuth buttons added to the signup page (matching the login page)
- **Delete account**: `DeleteAccountCard` added to the profile page (previously only accessible via direct URL)
- **Email templates**: Created `verify-email.html` and `org-invitation.html` transactional email templates (were missing, causing email sending to silently fail)
- **Error logging**: Added SLF4J logging with try-catch on workload and calendar endpoints to capture stack traces for the remaining 500 errors
- **Translation keys**: Added `continueWith`, `google`, `github` keys to `auth.signup` section in both `en.json` and `fr.json`

### Fixed
- **Signup t.rich error**: Replaced `t.rich()` (which caused "Functions are not valid as a React child") with standard `t()` string interpolation for the "Check your email" card
- **Invitation 401 for unauthenticated users**: `AcceptInvitationView` now checks session state before calling `getInvitation` API, showing sign-in prompt instead of a 401 error
- **Critical path DOMTokenList error**: Frappe Gantt `custom_class` now uses a single class name (instead of space-separated), preventing `classList.add()` failure
- **@team mention 500**: Added null guards on `projects.memberIds()` and `watchers.watcherIdsForTask()` in `CommentService` to prevent NPE when expanding @team mentions
- **Lint warnings**: Removed 6 unused import warnings across activity-feed, comparison-section, notification-center, task-detail-sheet, baseline-variance-view, and project-timeline
- **Zod validation**: Added proper `FieldError` validation to AddStatusDialog
- **Field component pattern**: Harmonized forms with shadcn Field pattern across 7 modules
- **Empty states**: Standardized empty states with consistent icon + message pattern
- **Optimistic updates**: Added optimistic update patterns for bulk operations

### Refactored
- **API route constants**: Centralized all `/api/*` strings in `ApiRoutes.java` constants class; refactored 19 controllers to use constants
- **Error boundary**: Created page-level `<ErrorBoundary>` component wrapping the authenticated layout
- **Loading states**: Standardized to Skeleton loaders for primary content (cards, tables, lists)
- **Drag-reorder**: Standardized dnd-kit pattern for all admin lists (status columns, custom fields)
- **Spinner standardization**: Converted raw `Loader2Icon` usage to shared `<Spinner>` component in `export-button.tsx` and `billing-page.tsx`
- **Bulk operations**: Extracted dependency logic, added drag-reorder for status/custom-fields

### Chores
- Cleaned up unused imports
- Updated `.env.example` documentation
- Updated module READMEs
- Updated QA manual regression test plan with bug fix verification sections

### Known Issues (Investigated but unresolved)
- **Workload 500 on empty project** (`GET /api/projects/{id}/workload`): Existing code handles empty tasks/members correctly; added error logging to capture stack trace on next failure
- **Holiday 500** (`PUT /api/projects/{id}/calendar`): `deleteAllInBatch` + flush + `saveAll` sequence should work; added error logging to capture stack trace on next failure
