import { LEGACY_HOSTS } from "@/lib/constants";
import { env } from "@/lib/env";

/**
 * Where a request made on a retired hostname should be sent, or null when the request is already
 * on the right host. Keeps search engines and shared links on a single domain.
 *
 * `host` is the Host header as received (it may carry a port), not the URL the framework
 * reconstructs: behind a proxy or in a self-hosted server those two can differ.
 */
export function legacyHostRedirect(host: string | null, pathAndQuery: string): URL | null {
  const hostname = host?.split(":")[0].toLowerCase();
  if (!hostname) return null;
  const canonical = new URL(env.siteUrl);
  if (hostname === canonical.hostname) return null;
  if (!LEGACY_HOSTS.includes(hostname)) return null;
  return new URL(pathAndQuery, canonical);
}
