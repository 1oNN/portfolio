import { toJsonLd } from "@/lib/json-ld";
import { AUTHOR_NAME, pageOpenGraph, SITE_URL } from "@/lib/metadata";
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

// The project set is fixed at build time. Without this, an unknown slug is
// rendered on demand and the host returns the not-found body with a 200 status,
// which search engines treat as a soft 404. Restricting to the generated params
// makes unknown slugs a real 404. Deliberately NOT applied to blog posts, which
// are database-backed and must stay renderable after publish without a rebuild.
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.id === slug);
  if (!project) return { title: "Project Not Found", robots: { index: false } };
  return {
    title: `${project.title} · Case Study`,
    description: project.tagline,
    alternates: { canonical: `${SITE_URL}/projects/${project.id}` },
    openGraph: pageOpenGraph({
      path: `/projects/${project.id}`,
      title: project.title,
      description: project.tagline,
      image: "route",
      article: {},
    }),
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.id === slug);
  if (!project) notFound();

  const caseStudy = getCaseStudy(project.id);
  if (!caseStudy) {
    // Project exists but has no case study written yet - 404 until one is added
    notFound();
  }

  const siteUrl = SITE_URL;
  const canonicalUrl = `${siteUrl}/projects/${project.id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: project.title,
    description: project.tagline,
    author: { "@type": "Person", name: AUTHOR_NAME, url: siteUrl },
    publisher: { "@type": "Person", name: AUTHOR_NAME, url: siteUrl },
    image: `${canonicalUrl}/opengraph-image`,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
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
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbLd) }}
      />
      <CaseStudyLayout project={project} caseStudy={caseStudy} />
    </>
  );
}
