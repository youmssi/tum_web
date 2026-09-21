"use client";

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  ListTodoIcon,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

import type { PortfolioProjectMetrics } from "./portfolio-api";
import { usePortfolio } from "./use-portfolio";

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-blue-500",
  IN_PROGRESS: "bg-amber-500",
  IN_REVIEW: "bg-purple-500",
  DONE: "bg-emerald-500",
};

export function PortfolioPage() {
  const { data, isLoading, error } = usePortfolio();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Empty className="min-h-64 border-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircleIcon />
          </EmptyMedia>
          <EmptyTitle>Failed to load portfolio</EmptyTitle>
          <EmptyDescription>
            There was an error loading your portfolio data. Please try again.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!data || data.projects.length === 0) {
    return (
      <Empty className="min-h-64 border-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutDashboardIcon />
          </EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>
            Create your first project to see portfolio stats here.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href={ROUTES.PROJECTS}>Go to projects</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Portfolio</h1>
        <p className="text-sm text-muted-foreground">
          Cross-project overview across {data.totalProjects} project
          {data.totalProjects !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<FolderKanbanIcon className="size-5" />}
          label="Total projects"
          value={data.totalProjects}
        />
        <SummaryCard
          icon={<ListTodoIcon className="size-5" />}
          label="Total tasks"
          value={data.totalTasks}
        />
        <SummaryCard
          icon={<CheckCircle2Icon className="size-5 text-emerald-500" />}
          label="Overall completion"
          value={`${data.overallCompletionPct}%`}
          progress={data.overallCompletionPct}
        />
        <SummaryCard
          icon={<AlertCircleIcon className="size-5 text-red-500" />}
          label="Overdue tasks"
          value={data.totalOverdue}
          highlight={data.totalOverdue > 0}
        />
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.projects.map((project) => (
          <ProjectCard key={project.projectId} project={project} />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  progress,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  progress?: number;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", highlight && "text-red-500")}>{value}</div>
        {progress !== undefined && <Progress value={progress} className="mt-2 h-2" />}
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: PortfolioProjectMetrics }) {
  const total = project.totalTasks;

  return (
    <Link href={`${ROUTES.PROJECTS}/${project.projectId}`}>
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base">{project.name}</CardTitle>
            {project.archived && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Archived
              </Badge>
            )}
          </div>
          <CardDescription>
            {total} task{total !== 1 ? "s" : ""}
            {project.overdueCount > 0 && (
              <span className="ml-2 text-red-500">· {project.overdueCount} overdue</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Completion bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Completion</span>
              <span>{project.completionPct}%</span>
            </div>
            <Progress value={project.completionPct} className="h-2" />
          </div>

          {/* Status breakdown */}
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(project.byStatus).map(([status, count]) =>
              count > 0 ? (
                <Badge key={status} variant="outline" className="gap-1 text-xs">
                  <span
                    className={cn(
                      "inline-block size-2 rounded-full",
                      STATUS_COLORS[status] ?? "bg-gray-400",
                    )}
                  />
                  {status.replace("_", " ")} {count}
                </Badge>
              ) : null,
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
