"use client";

import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { clearTokenCache } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

type InvitationStatus = "loading" | "ready" | "invalid" | "rejected";

interface InvitationData {
  organizationName: string;
  inviterEmail: string;
  role: string;
  organizationId?: string;
}

export function AcceptInvitationView({ token }: { token?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<InvitationStatus>("loading");
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    authClient.organization.getInvitation({ query: { id: token } }).then(({ data, error }) => {
      if (error || !data) {
        setStatus("invalid");
        return;
      }
      setInvitation({
        organizationName:
          (data as { organization?: { name?: string } }).organization?.name ?? "an organisation",
        inviterEmail: (data as { inviter?: { email?: string } }).inviter?.email ?? "",
        role: data.role ?? "member",
        organizationId: data.organizationId,
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
      toast.error(error.message ?? "Failed to accept invitation.");
      return;
    }
    const orgId =
      (data as { member?: { organizationId?: string } })?.member?.organizationId ??
      invitation?.organizationId;
    if (orgId) {
      await authClient.organization.setActive({ organizationId: orgId });
    }
    clearTokenCache();
    router.push(ROUTES.DASHBOARD);
    router.refresh();
  }

  async function handleReject() {
    if (!token) return;
    setIsBusy(true);
    const { error } = await authClient.organization.rejectInvitation({ invitationId: token });
    setIsBusy(false);
    if (error) {
      toast.error(error.message ?? "Failed to decline invitation.");
      return;
    }
    setStatus("rejected");
  }

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

  if (status === "invalid") {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <XCircleIcon className="mx-auto mb-2 size-12 text-destructive" />
          <CardTitle>Invalid invitation</CardTitle>
          <CardDescription>This invitation link is invalid or has expired.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.push(ROUTES.LOGIN)}>
            Back to login
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
          <Button variant="outline" onClick={() => router.push(ROUTES.LOGIN)}>
            Back to login
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
