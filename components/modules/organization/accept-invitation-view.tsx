"use client";

import { useQuery } from "@tanstack/react-query";
import { BuildingIcon, CheckCircleIcon, InboxIcon, XCircleIcon } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { clearOrgCache } from "@/lib/org-switch";

type UserInvitation = {
  id: string;
  role: string;
  organizationId: string;
  organizationName: string;
  status: string;
};

type InvitationDetail = {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName: string;
  inviterEmail: string;
};

// Invitation inbox — shown when no token is in the URL
function InvitationInbox() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [pasteInput, setPasteInput] = useState("");
  const [accepting, setAccepting] = useState<string | null>(null);
  const [declined, setDeclined] = useState<Set<string>>(new Set());

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["user-invitations"],
    queryFn: async () => {
      const { data } = await authClient.organization.listUserInvitations({});
      return (data as UserInvitation[]) ?? [];
    },
    enabled: !!session,
  });

  async function handleAccept(inv: UserInvitation) {
    setAccepting(inv.id);
    const { data, error } = await authClient.organization.acceptInvitation({
      invitationId: inv.id,
    });
    if (error) {
      toast.error((error as { message?: string }).message ?? "Failed to accept invitation.");
      setAccepting(null);
      return;
    }
    const orgId =
      (data as { member?: { organizationId?: string } })?.member?.organizationId ??
      inv.organizationId;
    if (orgId) await authClient.organization.setActive({ organizationId: orgId });
    clearOrgCache();
    router.push(ROUTES.DASHBOARD);
  }

  async function handleDecline(invId: string) {
    const { error } = await authClient.organization.rejectInvitation({ invitationId: invId });
    if (error) {
      toast.error((error as { message?: string }).message ?? "Failed to decline invitation.");
      return;
    }
    setDeclined((prev) => new Set([...prev, invId]));
    toast.success("Invitation declined.");
  }

  function handlePaste(e: React.FormEvent) {
    e.preventDefault();
    const input = pasteInput.trim();
    if (!input) return;
    let extracted = input;
    try {
      const url = new URL(input);
      extracted = url.searchParams.get("token") ?? input;
    } catch {
      // raw token
    }
    router.push(`${ROUTES.INVITATIONS_ACCEPT}?token=${encodeURIComponent(extracted)}`);
  }

  if (sessionPending || isLoading) {
    return (
      <div className="w-full max-w-lg space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!session) {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Pending invitations</CardTitle>
          <CardDescription>Sign in to see your organisation invitations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push(ROUTES.LOGIN)}>Sign in</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Pending invitations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Organisations that have invited you to join.
        </p>
      </div>

      {invitations && invitations.filter((i) => !declined.has(i.id)).length > 0 ? (
        <div className="space-y-3">
          {invitations
            .filter((i) => !declined.has(i.id))
            .map((inv) => (
              <Card key={inv.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <BuildingIcon className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium">{inv.organizationName}</p>
                    <Badge variant="secondary" className="mt-0.5 text-xs capitalize">
                      {inv.role}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(inv)}
                      disabled={accepting === inv.id}
                    >
                      {accepting === inv.id ? "Joining…" : "Accept"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDecline(inv.id)}
                      disabled={accepting === inv.id}
                    >
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-8">
            <InboxIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No pending invitations.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Have an invitation link? Paste it below.</p>
        <form onSubmit={handlePaste} className="flex gap-2 items-end">
          <Field className="flex-1">
            <FieldLabel>Paste invitation link</FieldLabel>
            <Input
              placeholder="https://…/invitations/accept?token=…"
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
            />
          </Field>
          <Button type="submit" variant="outline" disabled={!pasteInput.trim()}>
            Go
          </Button>
        </form>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() => router.push(ROUTES.WORKSPACES)}
      >
        ← Back to workspaces
      </Button>
    </div>
  );
}

type TokenStatus = "loading" | "ready" | "error" | "rejected";

export function AcceptInvitationView({ token }: { token?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<TokenStatus>(() => (token ? "loading" : "ready"));
  const [invitation, setInvitation] = useState<InvitationDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!token) return;
    authClient.organization.getInvitation({ query: { id: token } }).then(({ data, error }) => {
      if (error || !data) {
        const msg = (error as { message?: string })?.message?.toLowerCase().includes("recipient")
          ? "This invitation was sent to a different email address. Please sign in with the invited email to accept it."
          : "This invitation link is invalid or has expired.";
        setErrorMsg(msg);
        setStatus("error");
        return;
      }
      const d = data as InvitationDetail;
      setInvitation({
        id: d.id,
        email: d.email,
        role: d.role,
        organizationId: d.organizationId,
        organizationName: d.organizationName,
        inviterEmail: d.inviterEmail,
      });
      setStatus("ready");
    });
  }, [token]);

  async function handleAccept() {
    if (!token) return;
    setIsBusy(true);
    const { data, error } = await authClient.organization.acceptInvitation({
      invitationId: token,
    });
    setIsBusy(false);
    if (error) {
      toast.error((error as { message?: string }).message ?? "Failed to accept invitation.");
      return;
    }
    const orgId =
      (data as { member?: { organizationId?: string } })?.member?.organizationId ??
      invitation?.organizationId;
    if (orgId) await authClient.organization.setActive({ organizationId: orgId });
    clearOrgCache();
    router.push(ROUTES.DASHBOARD);
  }

  async function handleReject() {
    if (!token) return;
    setIsBusy(true);
    const { error } = await authClient.organization.rejectInvitation({ invitationId: token });
    setIsBusy(false);
    if (error) {
      toast.error((error as { message?: string }).message ?? "Failed to decline invitation.");
      return;
    }
    setStatus("rejected");
  }

  if (!token) return <InvitationInbox />;

  if (status === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <XCircleIcon className="mx-auto mb-2 size-12 text-destructive" />
          <CardTitle>Invitation unavailable</CardTitle>
          <CardDescription>{errorMsg}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.back()}>
            Go back
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "rejected") {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Invitation declined</CardTitle>
          <CardDescription>You have declined the invitation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.push(ROUTES.WORKSPACES)}>
            Go to workspaces
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CheckCircleIcon className="mb-2 size-10 text-green-500" />
        <CardTitle>You&apos;re invited!</CardTitle>
        <CardDescription>
          Join <strong>{invitation?.organizationName}</strong> as a{" "}
          <strong>{invitation?.role}</strong>.
          {invitation?.inviterEmail && <> Invited by {invitation.inviterEmail}.</>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!session ? (
          <p className="text-sm text-muted-foreground">
            You need to{" "}
            <a
              href={`${ROUTES.LOGIN}?next=${encodeURIComponent(`${ROUTES.INVITATIONS_ACCEPT}?token=${token}`)}`}
              className="underline"
            >
              sign in
            </a>{" "}
            or{" "}
            <a
              href={`${ROUTES.SIGNUP}?next=${encodeURIComponent(`${ROUTES.INVITATIONS_ACCEPT}?token=${token}`)}`}
              className="underline"
            >
              create an account
            </a>{" "}
            to accept this invitation.
          </p>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleAccept} disabled={isBusy} className="flex-1">
              {isBusy ? "Accepting…" : "Accept invitation"}
            </Button>
            <Button onClick={handleReject} variant="outline" disabled={isBusy}>
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
