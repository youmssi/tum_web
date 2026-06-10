"use client";

import { ArchiveIcon, LockIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

import { ROUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "./project-api";

export function ProjectCard({ project }: { project: Project }) {
  const createdAt = new Date(project.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`${ROUTES.PROJECTS}/${project.id}`} className="group block">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{project.name}</CardTitle>
            <div className="flex shrink-0 gap-1">
              {project.memberRestricted && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <LockIcon className="size-3" />
                  Members only
                </Badge>
              )}
              {project.archived && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <ArchiveIcon className="size-3" />
                  Archived
                </Badge>
              )}
            </div>
          </div>
          {project.description && (
            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
          )}
          <p className="text-xs text-muted-foreground">Created {createdAt}</p>
        </CardHeader>
      </Card>
    </Link>
  );
}
