"use client";

import { AlertCircleIcon } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "./use-analytics";
import { BurndownChart } from "./burndown-chart";
import { BurnupChart } from "./burnup-chart";
import { CycleTimeChart } from "./cycle-time-chart";
import { ThroughputChart } from "./throughput-chart";

interface AnalyticsPageProps {
  projectId: string;
}

export function AnalyticsPage({ projectId }: AnalyticsPageProps) {
  const { data, isLoading, isError, refetch, isRefetching } = useAnalytics(projectId);

  if (isError) {
    return (
      <Empty className="min-h-48 border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircleIcon />
          </EmptyMedia>
          <EmptyTitle>Failed to load analytics</EmptyTitle>
          <EmptyDescription>
            There was an error loading the analytics data. Please try again.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
            {isRefetching ? "Retrying..." : "Retry"}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <BurndownChart data={data?.burndown ?? []} isLoading={isLoading} />
        <BurnupChart data={data?.burnup ?? []} isLoading={isLoading} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <CycleTimeChart data={data?.cycleTime ?? []} isLoading={isLoading} />
        <ThroughputChart data={data?.throughput ?? []} isLoading={isLoading} />
      </div>
    </div>
  );
}
