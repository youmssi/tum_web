"use client";

import { FolderKanbanIcon } from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ImportProjectDialog } from "@/components/modules/import";
import { CreateProjectDialog } from "./create-project-dialog";
import { ProjectCard } from "./project-card";
import { useProjects } from "./use-projects";

export function ProjectList() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const { data: projects, isLoading } = useProjects(includeArchived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">All projects in your organisation.</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportProjectDialog />
          <CreateProjectDialog />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch id="show-archived" checked={includeArchived} onCheckedChange={setIncludeArchived} />
        <label htmlFor="show-archived" className="text-sm cursor-pointer">
          Show archived
        </label>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : !projects?.length ? (
        <Empty className="min-h-64 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderKanbanIcon />
            </EmptyMedia>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>Create your first project to start tracking work.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateProjectDialog />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
