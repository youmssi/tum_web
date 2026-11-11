export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  PORTFOLIO: "/portfolio",
  PROJECTS: "/projects",
  PROFILE: "/profile",
  BILLING: "/billing",
  ONBOARDING: "/onboarding",
  WORKSPACES: "/workspaces",
  ORGANIZATION_MEMBERS: "/organization/members",
  ORGANIZATION_SETTINGS: "/organization/settings",
  ORGANIZATION_AUDIT: "/organization/audit",
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_ORGS: "/admin/organisations",
  ADMIN_SUBSCRIPTIONS: "/admin/subscriptions",
  ADMIN_AUDIT: "/admin/audit",
  NOTIFICATION_PREFERENCES: "/notifications/preferences",
  INVITATIONS_ACCEPT: "/invitations/accept",
} as const;

export const AUTH_COOKIES = {
  SESSION: "better-auth.session_token",
  SESSION_SECURE: "__Secure-better-auth.session_token",
} as const;

export const COMPANY = {
  NAME: "MRVIN100 SARLU",
  URL: "https://mrvin100.de",
} as const;

export const CONTACT = {
  EMAIL: "contact@mrvin100.de",
  SUPPORT_EMAIL: "support@mrvin100.de",
  PRODUCT_REFERENCE: "Tûm",
} as const;

export const SITE_URL_DEFAULT = "https://tum.mrvin100.de";
