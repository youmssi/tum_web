/** "+2d" for a lag, "\u22122d" for a lead, nothing when the tasks are back to back. */
export function formatLag(days: number): string {
  if (days === 0) return "";
  return days > 0 ? ` +${days}d` : ` \u2212${Math.abs(days)}d`;
}
