import type { Metadata } from "next";

import { ProjectList } from "@/components/modules/projects";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <div className="p-6">
      <ProjectList />
    </div>
  );
}
