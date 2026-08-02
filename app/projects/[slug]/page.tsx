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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.co.uk";
  return {
    title: `${project.title} · Case Study`,
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
    // Project exists but has no case study written yet — 404 until one is added
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.co.uk";
  const canonicalUrl = `${siteUrl}/projects/${project.id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: project.title,
    description: project.tagline,
    author: { "@type": "Person", name: "Hammad Ahmad", url: siteUrl },
    url: canonicalUrl,
    keywords: project.tech.join(", "),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${siteUrl}/projects` },
      { "@type": "ListItem", position: 3, name: project.title, item: canonicalUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <CaseStudyLayout project={project} caseStudy={caseStudy} />
    </>
  );
}
