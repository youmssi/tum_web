"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

const settingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(60),
  slug: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens."),
});

type SettingsValues = z.infer<typeof settingsSchema>;

export function OrgSettingsForm() {
  const { data: activeOrg, isPending, refetch } = authClient.useActiveOrganization();

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { name: "", slug: "" },
  });

  useEffect(() => {
    if (activeOrg) {
      form.reset({ name: activeOrg.name, slug: activeOrg.slug ?? "" });
    }
  }, [activeOrg, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit({ name, slug }: SettingsValues) {
    const { error } = await authClient.organization.update({
      data: { name, slug },
    });
    if (error) {
      toast.error(error.message ?? "Failed to update settings.");
      return;
    }
    toast.success("Organisation settings saved.");
    refetch();
  }

  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Organisation settings</CardTitle>
        <CardDescription>Update your organisation name and URL slug.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FieldGroup className="gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-name">Organisation name</FieldLabel>
                  <Input {...field} id="settings-name" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-slug">URL slug</FieldLabel>
                  <Input {...field} id="settings-slug" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                activeOrg && form.reset({ name: activeOrg.name, slug: activeOrg.slug ?? "" })
              }
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
