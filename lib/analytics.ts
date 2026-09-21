type UmamiEventData = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: UmamiEventData) => void };
  }
}

/**
 * Fires a Umami custom event. No-ops silently when the script hasn't loaded — analytics
 * disabled (NEXT_PUBLIC_UMAMI_WEBSITE_ID / NEXT_PUBLIC_UMAMI_SRC unset), an ad-blocker stripped
 * it, or the request hasn't finished yet. Never throws, so callers can fire-and-forget from
 * click handlers without guarding.
 */
export function trackEvent(name: string, data?: UmamiEventData) {
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track(name, data);
  }
}
