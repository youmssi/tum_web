"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

type LoginFormValues = { email: string; password: string };

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("auth.login");

  const loginSchema = z.object({
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(1, t("passwordRequired")),
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginFormValues) {
    const { error } = await authClient.signIn.email(values);
    if (error) {
      toast.error(error.message ?? t("failed"));
      return;
    }
    router.push(ROUTES.DASHBOARD);
  }

  async function handleSocialSignIn(provider: "google" | "github") {
    await authClient.signIn.social({ provider, callbackURL: ROUTES.DASHBOARD });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>

      <CardContent>
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-email">{t("emailLabel")}</FieldLabel>
                  <Input
                    {...field}
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("emailPlaceholder")}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-password">{t("passwordLabel")}</FieldLabel>
                  <PasswordInput
                    {...field}
                    id="login-password"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("passwordPlaceholder")}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardContent className="pt-0">
        <FieldGroup className="gap-3">
          <Button type="submit" form="login-form" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>

          <FieldSeparator>{t("continueWith")}</FieldSeparator>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocialSignIn("google")}
          >
            {t("google")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocialSignIn("github")}
          >
            {t("github")}
          </Button>
        </FieldGroup>
      </CardContent>

      <CardFooter className="justify-center text-sm text-muted-foreground">
        {t("noAccount")}&nbsp;
        <Link
          href={ROUTES.SIGNUP}
          className="text-foreground underline underline-offset-4 hover:text-primary"
        >
          {t("signUpLink")}
        </Link>
      </CardFooter>
    </Card>
  );
}
