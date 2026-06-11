"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProject } from "./use-projects";

const createSchema = z.object({
  name: z.string().min(1, "Project name is required.").max(200),
  description: z.string().max(5000).optional(),
  memberRestricted: z.boolean(),
});

type CreateValues = z.infer<typeof createSchema>;

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const createProject = useCreateProject();

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", description: "", memberRestricted: false },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit({ name, description, memberRestricted }: CreateValues) {
    try {
      await createProject.mutateAsync({
        name,
        description: description || undefined,
        memberRestricted,
      });
      toast.success(`Project "${name}" created.`);
      form.reset();
      setOpen(false);
    } catch {
      toast.error("Failed to create project.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 size-4" />
          New project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Add a new project to your organisation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FieldGroup className="gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="project-name">Project name</FieldLabel>
                  <Input {...field} id="project-name" placeholder="My project" autoFocus />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="project-description">Description (optional)</FieldLabel>
                  <Textarea
                    {...field}
                    id="project-description"
                    placeholder="What is this project about?"
                    rows={3}
                  />
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
                    id="member-restricted"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <label htmlFor="member-restricted" className="text-sm cursor-pointer">
                    Restrict access to invited members only
                  </label>
                </div>
              )}
            />
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || createProject.isPending}>
              {createProject.isPending && <Spinner data-icon="inline-start" />}
              {createProject.isPending ? "Creating…" : "Create project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
