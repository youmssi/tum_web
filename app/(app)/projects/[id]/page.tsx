import type { Metadata } from "next";

import { ProjectDetail } from "@/components/modules/projects";

export const metadata: Metadata = {
  title: "Project",
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      <ProjectDetail id={id} />
    </div>
  );
}
