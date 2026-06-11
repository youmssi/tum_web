"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function SignupForm() {
  const t = useTranslations("auth.signup");
  const [emailSent, setEmailSent] = useState(false);

  const signupSchema = z
    .object({
      name: z.string().min(2, t("nameMin")),
      email: z.string().email(t("invalidEmail")),
      password: z.string().min(8, t("passwordMin")).max(72, t("passwordMax")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit({ name, email, password }: SignupFormValues) {
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) {
      toast.error(error.message ?? t("failed"));
      return;
    }
    setEmailSent(true);
  }

  if (emailSent) {
    return (
      <Card className="w-full text-center">
        <CardHeader>
          <CardTitle className="text-xl">{t("checkEmailTitle")}</CardTitle>
          <CardDescription>
            {t("checkEmailBody", { email: form.getValues("email") })}
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link
            href={ROUTES.LOGIN}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
          >
            {t("backToSignIn")}
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Resolving the translations into local consts before render sidesteps a React Compiler /
  // next-intl interaction where the inline {t("subtitle")} could be passed downstream as the
  // translator function reference itself rather than the resolved string.
  const heading = t("title");
  const subtitle = t("subtitle");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">{heading}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>

      <CardContent>
        <form id="signup-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signup-name">{t("nameLabel")}</FieldLabel>
                  <Input
                    {...field}
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("namePlaceholder")}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signup-email">{t("emailLabel")}</FieldLabel>
                  <Input
                    {...field}
                    id="signup-email"
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
                  <FieldLabel htmlFor="signup-password">{t("passwordLabel")}</FieldLabel>
                  <PasswordInput
                    {...field}
                    id="signup-password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("passwordPlaceholder")}
                  />
                  <FieldDescription>{t("passwordHint")}</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signup-confirm-password">{t("confirmLabel")}</FieldLabel>
                  <PasswordInput
                    {...field}
                    id="signup-confirm-password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("confirmPlaceholder")}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardContent className="pt-0">
        <Button type="submit" form="signup-form" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Spinner data-icon="inline-start" />}
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </CardContent>

      <CardContent className="pt-0">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {t("continueWith")}
            </span>
          </div>
        </div>
      </CardContent>

      <CardContent className="pt-0 flex flex-col gap-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            const { error } = await authClient.signIn.social({ provider: "google" });
            if (error) toast.error(error.message ?? t("failed"));
          }}
        >
          <svg className="mr-2 size-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t("google")}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            const { error } = await authClient.signIn.social({ provider: "github" });
            if (error) toast.error(error.message ?? t("failed"));
          }}
        >
          <svg className="mr-2 size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" />
          </svg>
          {t("github")}
        </Button>
      </CardContent>

      <CardFooter className="justify-center text-sm text-muted-foreground">
        {t("haveAccount")}&nbsp;
        <Link
          href={ROUTES.LOGIN}
          className="text-foreground underline underline-offset-4 hover:text-primary"
        >
          {t("loginLink")}
        </Link>
      </CardFooter>
    </Card>
  );
}
