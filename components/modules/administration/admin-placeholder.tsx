import { ConstructionIcon } from "lucide-react";

interface AdminPlaceholderProps {
  title: string;
  description: string;
}

/**
 * Placeholder for admin sub-pages that exist in the sidebar but aren't built yet (Users, Orgs,
 * Subscriptions, Audit). Renders the same shell as a finished page so admins know they navigated
 * somewhere real — and so the sidebar links don't 404 during v1.
 */
export function AdminPlaceholder({ title, description }: AdminPlaceholderProps) {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
        <ConstructionIcon className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">Coming soon.</p>
      </div>
    </div>
  );
}
