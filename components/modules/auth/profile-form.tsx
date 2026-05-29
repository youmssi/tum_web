"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { AvatarUpload } from "@/components/modules/files";

type ProfileFormValues = { name: string };

export function ProfileForm() {
  const router = useRouter();
  const t = useTranslations("auth.profile");
  const tProfile = useTranslations("profile");
  const tSignup = useTranslations("auth.signup");
  const tCommon = useTranslations("common");
  const { data: session, isPending } = authClient.useSession();

  const profileSchema = z.object({
    name: z.string().min(2, tSignup("nameMin")),
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (session?.user?.name) {
      form.reset({ name: session.user.name });
    }
  }, [session, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit(values: ProfileFormValues) {
    const { error } = await authClient.updateUser(values);
    if (error) {
      toast.error(error.message ?? t("saveFailed"));
      return;
    }
    toast.success(t("saved"));
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push(ROUTES.LOGIN);
  }

  if (isPending) {
    return (
      <div className="space-y-3 p-6">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-8 w-full animate-pulse rounded bg-muted" />
      </div>
    );
  }

  async function handleAvatarUploaded(url: string) {
    const { error } = await authClient.updateUser({ image: url });
    if (error) toast.error(t("saveFailed"));
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          {session?.user?.id && (
            <AvatarUpload
              entityType="PROFILE"
              entityId={session.user.id}
              currentUrl={session.user.image}
              initials={(session.user.name ?? session.user.email ?? "?").slice(0, 2).toUpperCase()}
              onUploaded={handleAvatarUploaded}
            />
          )}
          <div>
            <CardTitle>{tProfile("title")}</CardTitle>
            <CardDescription>
              {session?.user?.email}
              {session?.user?.emailVerified ? (
                <span className="ml-2 text-xs text-green-600">✓</span>
              ) : (
                <span className="ml-2 text-xs text-yellow-600">!</span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-name">{t("nameLabel")}</FieldLabel>
                  <Input
                    {...field}
                    id="profile-name"
                    type="text"
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          <Button type="submit" form="profile-form" disabled={isSubmitting}>
            {isSubmitting ? t("saving") : t("save")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            {tCommon("cancel")}
          </Button>
        </div>
      </CardContent>

      <CardContent className="pt-0">
        <Separator className="mb-4" />
        <Button variant="outline" type="button" onClick={handleSignOut}>
          {t("signOut")}
        </Button>
      </CardContent>
    </Card>
  );
}
