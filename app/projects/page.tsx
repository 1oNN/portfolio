import type { Metadata } from "next";
import ProjectsView from "./ProjectsView";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected engineering and research projects by Hammad Ahmad — AI/ML Engineer.",
};

export default function ProjectsPage() {
  return <ProjectsView />;
}
