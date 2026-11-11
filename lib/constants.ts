export const ROUTES = {
  HOME: "/",
  FEATURES: "/features",
  PRICING: "/pricing",
  LEGAL: "/legal",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  HOW_IT_WORKS: "/#how-it-works",
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
  TRADE_NAME: "MRVIN100",
  URL: "https://mrvin100.de",
  ADDRESS: "Kaporo-Rails, C/Ratoma, Conakry",
  COUNTRY_CODE: "GN",
  RCCM: "GN.TCC.2026.B.14483",
  TAX_ID: "814824199",
} as const;

export const CONTACT = {
  EMAIL: "contact@mrvin100.de",
  SUPPORT_EMAIL: "support@mrvin100.de",
  PRODUCT_REFERENCE: "Tûm",
} as const;

export const SITE_URL_DEFAULT = "https://tum.mrvin100.de";

/** Monthly USD price per workspace; `annual` is the monthly equivalent when billed yearly. */
export const PLAN_PRICES = {
  community: { monthly: 0, annual: 0 },
  pro: { monthly: 20, annual: 17 },
  enterprise: { monthly: 99, annual: 84 },
} as const;

export const PUBLIC_MARKETING_PATHS = [
  ROUTES.FEATURES,
  ROUTES.PRICING,
  ROUTES.LEGAL,
  ROUTES.TERMS,
  ROUTES.PRIVACY,
] as const;

/** Hostnames that used to serve the site and now only redirect to the production domain. */
export const LEGACY_HOSTS: readonly string[] = ["tum-app.vercel.app"];
