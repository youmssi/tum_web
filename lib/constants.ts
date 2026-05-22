export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
  PROFILE: "/profile",
  ONBOARDING: "/onboarding",
  ORGANIZATION_MEMBERS: "/organization/members",
  ORGANIZATION_SETTINGS: "/organization/settings",
  NOTIFICATION_PREFERENCES: "/notifications/preferences",
  INVITATIONS_ACCEPT: "/invitations/accept",
} as const;

export const AUTH_COOKIES = {
  SESSION: "better-auth.session_token",
  SESSION_SECURE: "__Secure-better-auth.session_token",
} as const;
