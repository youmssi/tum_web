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
            {t.rich("checkEmailBody", {
              email: () => <strong>{form.getValues("email")}</strong>,
            })}
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
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
          {isSubmitting ? t("submitting") : t("submit")}
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
