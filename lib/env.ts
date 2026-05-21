/**
 * Typed access to public runtime configuration.
 * Only NEXT_PUBLIC_* variables are available in the browser.
 */
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const env = {
  apiBaseUrl,
} as const;
