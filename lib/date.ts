/**
 * Date-only (yyyy-MM-dd) helpers that stay in the LOCAL calendar.
 *
 * The timeline stores dates as `yyyy-MM-dd` strings with no time or zone. Going through
 * `new Date(isoString)` (UTC) or `Date.toISOString()` (UTC) shifts the day for any user west of
 * UTC, so dragging a bar could persist the wrong date. These helpers parse and format using local
 * calendar fields only, keeping the round-trip stable regardless of the viewer's timezone.
 */

/** Parse a `yyyy-MM-dd` string as local midnight (never UTC). */
export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date to `yyyy-MM-dd` using local calendar fields (never UTC). */
export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Today as a `yyyy-MM-dd` string in the local calendar. */
export function todayLocalDate(): string {
  return formatLocalDate(new Date());
}
