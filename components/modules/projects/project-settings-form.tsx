"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/constants";
import { useDeleteProject, useProject, useUpdateProject } from "./use-projects";

const settingsSchema = z.object({
  name: z.string().min(1, "Project name is required.").max(200),
  description: z.string().max(5000).optional(),
  memberRestricted: z.boolean(),
});

type SettingsValues = z.infer<typeof settingsSchema>;

export function ProjectSettingsForm({ id }: { id: string }) {
  const router = useRouter();
  const { data: project, isLoading } = useProject(id);
  const updateProject = useUpdateProject(id);
  const deleteProject = useDeleteProject();

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { name: "", description: "", memberRestricted: false },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description ?? "",
        memberRestricted: project.memberRestricted,
      });
    }
  }, [project, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit({ name, description, memberRestricted }: SettingsValues) {
    try {
      await updateProject.mutateAsync({ name, description: description || undefined, memberRestricted });
      toast.success("Project settings saved.");
    } catch {
      toast.error("Failed to save settings.");
    }
  }

  async function handleDelete() {
    try {
      await deleteProject.mutateAsync(id);
      toast.success("Project deleted.");
      router.push(ROUTES.PROJECTS);
    } catch {
      toast.error("Failed to delete project.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-lg">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Project settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage settings for <span className="font-medium">{project?.name}</span>.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Update the project name and description.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FieldGroup className="gap-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="settings-name">Project name</FieldLabel>
                    <Input {...field} id="settings-name" />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="settings-description">Description</FieldLabel>
                    <Textarea {...field} id="settings-description" rows={3} />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="memberRestricted"
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="settings-member-restricted"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label htmlFor="settings-member-restricted" className="text-sm cursor-pointer">
                      Restrict access to invited members only
                    </label>
                  </div>
                )}
              />
            </FieldGroup>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting || updateProject.isPending}>
                {updateProject.isPending ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  project &&
                  form.reset({
                    name: project.name,
                    description: project.description ?? "",
                    memberRestricted: project.memberRestricted,
                  })
                }
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator className="max-w-lg" />

      <Card className="max-w-lg border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>Permanently delete this project and all its data.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleteProject.isPending}>
                <Trash2Icon className="mr-2 size-4" />
                Delete project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &ldquo;{project?.name}&rdquo;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the project and all its tasks, comments, and
                  activity. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
