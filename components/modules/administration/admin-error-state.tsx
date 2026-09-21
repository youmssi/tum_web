import { ShieldAlertIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/**
 * Shared error/forbidden state for admin list pages. The backend 403s any admin endpoint the
 * caller isn't authorised for, so every list query can land in the same two buckets — surface
 * that distinction rather than a generic "something went wrong".
 */
export function AdminErrorState({ error }: { error: unknown }) {
  const status =
    typeof (error as { response?: { status?: number } })?.response?.status === "number"
      ? (error as { response?: { status?: number } }).response?.status
      : null;
  const isForbidden = status === 403;

  return (
    <Empty className="min-h-48 border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldAlertIcon />
        </EmptyMedia>
        <EmptyTitle>
          {isForbidden ? "You don't have admin access." : "Couldn't load this page."}
        </EmptyTitle>
        <EmptyDescription>
          {isForbidden
            ? "This section is restricted to app-wide administrators."
            : "Something went wrong fetching this data. Try refreshing the page."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
