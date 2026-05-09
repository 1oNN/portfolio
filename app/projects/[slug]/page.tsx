import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS } from "@/lib/constants";
import { getCaseStudy } from "@/lib/case-studies";
import CaseStudyLayout from "@/components/case-study/CaseStudyLayout";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.id === slug);
  if (!project) return { title: "Project Not Found" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.dev";
  return {
    title: `${project.title} · Case Study | Hammad Ahmad`,
    description: project.tagline,
    alternates: { canonical: `${siteUrl}/projects/${project.id}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.tagline,
      url: `${siteUrl}/projects/${project.id}`,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.id === slug);
  if (!project) notFound();

  const caseStudy = getCaseStudy(project.id);
  if (!caseStudy) {
    // Project exists but no case study yet — render a graceful fallback rather than 404
    notFound();
  }

  return <CaseStudyLayout project={project} caseStudy={caseStudy} />;
}
