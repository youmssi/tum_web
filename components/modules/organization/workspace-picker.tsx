"use client";

import { BuildingIcon, MailIcon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

export function WorkspacePicker() {
  const router = useRouter();
  const { data: orgs, isPending } = authClient.useListOrganizations();
  const [activating, setActivating] = useState<string | null>(null);

  async function handleSelect(orgId: string) {
    setActivating(orgId);
    const { error } = await authClient.organization.setActive({ organizationId: orgId });
    if (error) {
      toast.error(error.message ?? "Failed to switch workspace.");
      setActivating(null);
      return;
    }
    router.push(ROUTES.DASHBOARD);
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Choose a workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a workspace to continue or create a new one.
        </p>
      </div>

      {isPending ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : orgs && orgs.length > 0 ? (
        <div className="space-y-3">
          {orgs.map((org) => (
            <button
              key={org.id}
              type="button"
              className="flex w-full items-center gap-4 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent disabled:opacity-60"
              onClick={() => handleSelect(org.id)}
              disabled={activating !== null}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <BuildingIcon className="size-5 text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{org.name}</p>
                <p className="truncate text-xs text-muted-foreground">{org.slug ?? org.id}</p>
              </div>
              {activating === org.id && (
                <span className="text-xs text-muted-foreground">Loading…</span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">No workspaces yet</CardTitle>
            <CardDescription>
              Create a new workspace or accept an invitation to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full" onClick={() => router.push(ROUTES.ONBOARDING)}>
          <PlusCircleIcon className="mr-2 size-4" />
          Create new
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(ROUTES.INVITATIONS_ACCEPT)}
        >
          <MailIcon className="mr-2 size-4" />
          Invitations
        </Button>
      </div>
    </div>
  );
}
