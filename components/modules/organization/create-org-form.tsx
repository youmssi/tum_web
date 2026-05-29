"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { clearOrgCache } from "@/lib/org-switch";

const createOrgSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(60),
  slug: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens.")
    .or(z.literal("")),
});

type CreateOrgValues = z.infer<typeof createOrgSchema>;

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 30);
}

export function CreateOrgForm() {
  const router = useRouter();
  const form = useForm<CreateOrgValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { name: "", slug: "" },
  });

  const nameValue = useWatch({ control: form.control, name: "name", defaultValue: "" });

  useEffect(() => {
    form.setValue("slug", toSlug(nameValue), { shouldValidate: false });
  }, [nameValue, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit({ name, slug }: CreateOrgValues) {
    const { error } = await authClient.organization.create({
      name,
      slug: slug || toSlug(name),
    });
    if (error) {
      toast.error(error.message ?? "Failed to create organisation.");
      return;
    }
    clearOrgCache();
    router.push(ROUTES.DASHBOARD);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create your organisation</CardTitle>
        <CardDescription>Your workspace for managing projects and teams.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FieldGroup className="gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="org-name">Organisation name</FieldLabel>
                  <Input {...field} id="org-name" placeholder="Acme Corp" autoFocus />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="org-slug">URL slug</FieldLabel>
                  <Input {...field} id="org-slug" placeholder="acme-corp" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create organisation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
