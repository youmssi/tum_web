import type { Metadata } from "next";

import { ProjectSettingsForm } from "@/components/modules/projects";

export const metadata: Metadata = {
  title: "Project settings",
};

export default async function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="p-6">
      <ProjectSettingsForm id={id} />
    </div>
  );
}
