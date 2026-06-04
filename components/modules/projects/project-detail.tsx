"use client";

import {
  ActivityIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  ArrowLeftIcon,
  CalendarRangeIcon,
  FolderKanbanIcon,
  LayoutListIcon,
  SlidersHorizontalIcon,
  SquareKanbanIcon,
  XIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ActivityFeed } from "@/components/modules/activity";
import { ProjectDashboard } from "@/components/modules/analytics";
import { KanbanBoard } from "@/components/modules/board";
import { ProjectTimeline } from "@/components/modules/timeline";
import { TaskList, useRealtimeTasks } from "@/components/modules/tasks";
import { authClient } from "@/lib/auth-client";
import { ExportProjectButton } from "./export-button";
import { useProject, useToggleArchive } from "./use-projects";

export function ProjectDetail({ id }: { id: string }) {
  const router = useRouter();
  const tProjects = useTranslations("projects");
  const tabs = useTranslations("projects.tabs");
  const { data: project, isLoading } = useProject(id);
  const toggleArchive = useToggleArchive();
  const { data: activeOrg } = authClient.useActiveOrganization();
  useRealtimeTasks(id, activeOrg?.id ?? null);

  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

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

  const isTimelineTab = activeTab === "timeline";

  return (
    <div className={cn("space-y-6", isTimelineTab && "flex min-h-0 flex-1 flex-col")}>
      <div className={cn(isTimelineTab && "shrink-0")}>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2 text-muted-foreground" asChild>
          <Link href={ROUTES.PROJECTS}>
            <ArrowLeftIcon className="mr-1 size-4" />
            Projects
          </Link>
        </Button>
      </div>
      <div className={cn("flex items-start justify-between gap-4", isTimelineTab && "shrink-0")}>
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

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {activeTab === "timeline" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <CalendarRangeIcon className="size-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d")} – {format(dateRange.to, "MMM d")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d")
                    )
                  ) : (
                    "Date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
          {activeTab === "timeline" && dateRange && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground"
              onClick={() => setDateRange(undefined)}
              title="Clear date filter"
            >
              <XIcon className="size-4" />
            </Button>
          )}
          <ExportProjectButton projectId={project.id} projectName={project.name} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleArchive}
            disabled={toggleArchive.isPending}
          >
            {project.archived ? (
              <>
                <ArchiveRestoreIcon className="mr-2 size-4" />
                {tProjects("restore")}
              </>
            ) : (
              <>
                <ArchiveIcon className="mr-2 size-4" />
                {tProjects("archive")}
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${project.id}/settings`}>
              <SlidersHorizontalIcon className="mr-2 size-4" />
              {tProjects("openSettings")}
            </Link>
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className={cn(isTimelineTab && "flex min-h-0 flex-1 flex-col")}
      >
        <TabsList className={cn(isTimelineTab && "shrink-0")}>
          <TabsTrigger value="overview" className="gap-1.5">
            <FolderKanbanIcon className="size-4" />
            {tabs("overview")}
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5">
            <LayoutListIcon className="size-4" />
            {tabs("list")}
          </TabsTrigger>
          <TabsTrigger value="board" className="gap-1.5">
            <SquareKanbanIcon className="size-4" />
            {tabs("board")}
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5">
            <CalendarRangeIcon className="size-4" />
            {tabs("timeline")}
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5">
            <ActivityIcon className="size-4" />
            {tabs("activity")}
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

        <TabsContent value="timeline" className="mt-4 flex min-h-0 flex-1 flex-col">
          <ProjectTimeline projectId={project.id} dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <ActivityFeed projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
