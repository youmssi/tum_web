"use client";

import {
  ActivityIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  FolderKanbanIcon,
  LayoutListIcon,
  SlidersHorizontalIcon,
  SquareKanbanIcon,
  CalendarRangeIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/constants";
import { ActivityFeed } from "@/components/modules/activity";
import { ProjectDashboard } from "@/components/modules/analytics";
import { KanbanBoard } from "@/components/modules/board";
import { ProjectTimeline } from "@/components/modules/timeline";
import { TaskList, useRealtimeTasks } from "@/components/modules/tasks";
import { authClient } from "@/lib/auth-client";
import { useProject, useToggleArchive } from "./use-projects";

function PlaceholderTab({ label, epic }: { label: string; epic: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">Coming in {epic}</p>
    </div>
  );
}

export function ProjectDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: project, isLoading } = useProject(id);
  const toggleArchive = useToggleArchive();
  const { data: activeOrg } = authClient.useActiveOrganization();
  useRealtimeTasks(id, activeOrg?.id ?? null);

  async function handleToggleArchive() {
    if (!project) return;
    try {
      await toggleArchive.mutateAsync({ id: project.id, archived: project.archived });
      toast.success(project.archived ? "Project restored." : "Project archived.");
    } catch {
      toast.error("Failed to update project.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2">
        <FolderKanbanIcon className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Project not found.</p>
        <Button variant="outline" onClick={() => router.push(ROUTES.PROJECTS)}>
          Back to projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{project.name}</h1>
            {project.archived && (
              <Badge variant="secondary" className="gap-1">
                <ArchiveIcon className="size-3" />
                Archived
              </Badge>
            )}
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleArchive}
            disabled={toggleArchive.isPending}
          >
            {project.archived ? (
              <>
                <ArchiveRestoreIcon className="mr-2 size-4" />
                Restore
              </>
            ) : (
              <>
                <ArchiveIcon className="mr-2 size-4" />
                Archive
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${project.id}/settings`}>
              <SlidersHorizontalIcon className="mr-2 size-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <FolderKanbanIcon className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5">
            <LayoutListIcon className="size-4" />
            List
          </TabsTrigger>
          <TabsTrigger value="board" className="gap-1.5">
            <SquareKanbanIcon className="size-4" />
            Board
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5">
            <CalendarRangeIcon className="size-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5">
            <ActivityIcon className="size-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <ProjectDashboard projectId={project.id} />
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <TaskList projectId={project.id} />
        </TabsContent>

        <TabsContent value="board" className="mt-4">
          <KanbanBoard projectId={project.id} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <ProjectTimeline projectId={project.id} />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <ActivityFeed projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
