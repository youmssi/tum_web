"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
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
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginFormValues) {
    const { error } = await authClient.signIn.email(values);
    if (error) {
      form.setError("root", {
        message: error.message ?? "Sign-in failed. Please try again.",
      });
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
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your Tûm account</CardDescription>
      </CardHeader>

      <CardContent>
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="you@example.com"
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
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {form.formState.errors.root && (
              <FieldError>{form.formState.errors.root.message}</FieldError>
            )}
          </FieldGroup>
        </form>
      </CardContent>

      <CardContent className="pt-0">
        <FieldGroup className="gap-3">
          <Button type="submit" form="login-form" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>

          <FieldSeparator>or continue with</FieldSeparator>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocialSignIn("google")}
          >
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocialSignIn("github")}
          >
            Continue with GitHub
          </Button>
        </FieldGroup>
      </CardContent>

      <CardFooter className="justify-center text-sm text-muted-foreground">
        No account?&nbsp;
        <Link
          href={ROUTES.SIGNUP}
          className="text-foreground underline underline-offset-4 hover:text-primary"
        >
          Sign up
        </Link>
      </CardFooter>
    </Card>
  );
}
