"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
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
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

/**
 * Danger-zone card on the profile page. Triggers Better Auth's `deleteUser` flow, which the
 * server-side {@code user.deleteUser.afterDelete} hook completes with the Polar customer cleanup
 * + backend assignee scrubbing.
 *
 * <p>Requires the user to type their full email as confirmation — the dialog won't enable the
 * destructive button until the strings match exactly. Same UX pattern as Linear / GitHub.
 *
 * <p>Reads the session itself so the parent page stays a thin shell.
 */
export function DeleteAccountCard() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userEmail = session?.user?.email ?? "";
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const canDelete = !!userEmail && confirmation === userEmail && !pending;

  function handleDelete() {
    setPending(true);
    // authClient.deleteUser is a Better Auth method that returns { data, error }. We use
    // .then/.catch instead of try/await so the loading state stays bound to the dialog regardless
    // of which branch the response takes.
    authClient
      .deleteUser()
      .then(({ error }) => {
        if (error) {
          toast.error(error.message ?? "Could not delete your account.");
          setPending(false);
          return;
        }
        toast.success("Your account has been deleted.");
        // Hard redirect to wipe any cached SDK state — the session cookie is already gone server
        // side, but a router.replace would briefly try to render the auth-required layout first.
        window.location.href = ROUTES.HOME;
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Could not delete your account.");
        setPending(false);
      });
    void router; // kept for future enhancements
  }

  return (
    <Card className="w-full max-w-lg border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Delete account</CardTitle>
        <CardDescription>
          Permanently delete your Tûm account. This signs you out of every workspace, removes your
          profile, and cancels the Polar customer record. Tasks you were assigned to stay in the
          project but show &ldquo;Former member&rdquo; instead of your name. This action cannot be
          undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog
          onOpenChange={(open) => {
            if (!open) setConfirmation("");
          }}
        >
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2Icon className="mr-2 size-4" />
              Delete my account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Permanently delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                Type <span className="font-mono font-semibold">{userEmail}</span> to confirm. After
                you click delete this can&rsquo;t be reversed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Field>
              <FieldLabel htmlFor="delete-account-confirm">Email</FieldLabel>
              <Input
                id="delete-account-confirm"
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
                {pending && <Spinner data-icon="inline-start" />}
                {pending ? "Deleting…" : "Delete account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
