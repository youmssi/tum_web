"use client";

import { AlertTriangleIcon, Trash2Icon } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useBillingState } from "@/components/modules/billing";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

/**
 * Danger-zone card for organisation settings. Calls Better Auth's organisation.delete which
 * removes the org + every membership row. Spring's per-org tenant data (projects, tasks,
 * comments, audit) is left in place — the Hibernate tenant filter makes it unreachable since no
 * JWT can carry the deleted org id anymore. A future sweeper epic can cascade-delete the rows
 * if storage becomes a concern; for the MVP the orphan rows are invisible.
 *
 * <p>Renders nothing for non-owners. Admins and members can't delete via the API anyway, so
 * hiding the UI avoids the misleading "delete then error" round-trip. Reads org + session itself
 * so the parent page stays a thin shell.
 */
export function DeleteOrgCard() {
  const router = useRouter();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const billing = useBillingState();
  const currentRole =
    activeOrg?.members?.find((m) => m.userId === session?.user?.id)?.role ?? "member";
  const isOwner = currentRole === "owner";
  const hasActiveSubscription = billing.data?.kind === "subscription";

  const organizationId = activeOrg?.id ?? "";
  const organizationName = activeOrg?.name ?? "";
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);

  if (!isOwner || !organizationId) return null;

  const canDelete = confirmation === organizationName && !pending;

  function handleDelete() {
    setPending(true);
    authClient.organization
      .delete({ organizationId })
      .then(({ error }) => {
        if (error) {
          toast.error(error.message ?? "Could not delete the organisation.");
          setPending(false);
          return;
        }
        toast.success("Organisation deleted.");
        // Send the user to the workspace picker. If they belong to no other orgs the picker
        // shows the create/join CTAs; if they belong to one or more, they can pick.
        router.push(ROUTES.WORKSPACES);
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Could not delete the organisation.");
        setPending(false);
      });
  }

  return (
    <Card className="w-full max-w-lg border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Delete organisation</CardTitle>
        <CardDescription>
          Permanently delete <span className="font-medium">{organizationName}</span>. Every member
          loses access immediately, every project and task is unreachable, and any active Polar
          subscription for this workspace is canceled at the end of the current billing period. This
          action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasActiveSubscription && (
          <div className="flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-50/40 p-3 text-sm dark:bg-amber-950/20">
            <AlertTriangleIcon className="size-4 shrink-0 text-amber-600" aria-hidden />
            <div className="space-y-1">
              <p className="font-medium">This workspace has an active subscription.</p>
              <p className="text-muted-foreground">
                Cancel it first in the billing portal so Polar stops billing your card. Deleting the
                workspace doesn&rsquo;t cancel the subscription automatically.
              </p>
              <Button variant="link" className="h-auto p-0 text-sm" asChild>
                <Link href={ROUTES.BILLING}>Open billing portal →</Link>
              </Button>
            </div>
          </div>
        )}
        <AlertDialog
          onOpenChange={(open) => {
            if (!open) setConfirmation("");
          }}
        >
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2Icon className="mr-2 size-4" />
              Delete organisation
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Permanently delete &ldquo;{organizationName}&rdquo;?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Type <span className="font-mono font-semibold">{organizationName}</span> to confirm.
                After you click delete this can&rsquo;t be reversed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Field>
              <FieldLabel htmlFor="delete-org-confirm">Organisation name</FieldLabel>
              <Input
                id="delete-org-confirm"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <FieldDescription>Match exactly — capitalisation matters.</FieldDescription>
            </Field>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={!canDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {pending ? "Deleting…" : "Delete organisation"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
