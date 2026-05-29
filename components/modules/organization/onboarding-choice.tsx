"use client";

import { BuildingIcon, UsersIcon } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { CreateOrgForm } from "./create-org-form";

type Step = "choice" | "create" | "join";

export function OnboardingChoice() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choice");
  const [inviteInput, setInviteInput] = useState("");

  function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input = inviteInput.trim();
    if (!input) return;
    let token = input;
    try {
      const url = new URL(input);
      token = url.searchParams.get("token") ?? input;
    } catch {
      // not a URL — use raw value as token
    }
    router.push(`${ROUTES.INVITATIONS_ACCEPT}?token=${encodeURIComponent(token)}`);
  }

  if (step === "create") {
    return (
      <div className="w-full max-w-md space-y-4">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => setStep("choice")}>
          ← Back
        </Button>
        <CreateOrgForm />
      </div>
    );
  }

  if (step === "join") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join an organisation</CardTitle>
          <CardDescription>Paste the invitation link from your email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <Input
              autoFocus
              placeholder="https://…/invitations/accept?token=…"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={!inviteInput.trim()} className="flex-1">
                Continue
              </Button>
              <Button type="button" variant="outline" onClick={() => setStep("choice")}>
                Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Welcome to Tûm</h1>
        <p className="mt-2 text-sm text-muted-foreground">How would you like to get started?</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setStep("create")}
          className="group flex flex-col gap-3 rounded-xl border p-6 text-left transition-colors hover:border-primary hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BuildingIcon className="size-8 text-muted-foreground transition-colors group-hover:text-primary" />
          <div>
            <p className="font-medium">Create an organisation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start fresh — invite your team and manage projects.
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setStep("join")}
          className="group flex flex-col gap-3 rounded-xl border p-6 text-left transition-colors hover:border-primary hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <UsersIcon className="size-8 text-muted-foreground transition-colors group-hover:text-primary" />
          <div>
            <p className="font-medium">Join an existing org</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Have an invitation link? Paste it here to join.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
