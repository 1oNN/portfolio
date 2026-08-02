import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import SectionHeader from "@/components/ui/SectionHeader";
import FeaturedCard from "@/components/case-study/FeaturedCard";
import ListingCard from "@/components/case-study/ListingCard";
import { getCaseStudy } from "@/lib/case-studies";
import { PROJECTS } from "@/lib/constants";

// The single bentoSize:"large" entry is the hero card; fall back to the
// first featured project if that field is ever removed or every project is
// re-sized to "medium".
const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);
const featured = FEATURED_PROJECTS.find((p) => p.bentoSize === "large") ?? FEATURED_PROJECTS[0];
const rest = FEATURED_PROJECTS.filter((p) => p.id !== featured?.id);

export default function HomeProjects() {
  return (
    <section id="projects" className="border-t" style={{ borderColor: "var(--border)" }}>
      <div className="py-14 sm:py-16">
        <SectionHeader
          number="03"
          eyebrow="Selected work"
          title="Projects & case studies"
          description="Selected projects spanning AI research, ML systems, and full-stack engineering — each backed by a full case study on the architecture and the decisions behind it."
        />

        {featured && (
          <div className="mt-10">
            <FeaturedCard project={featured} caseStudy={getCaseStudy(featured.id)} />
          </div>
        )}

        {rest.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {rest.map((project) => (
              <ListingCard key={project.id} project={project} caseStudy={getCaseStudy(project.id)} />
            ))}
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--accent)" }}
          >
            All projects
            <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
              {PROJECTS.length}
            </span>
            <FiArrowRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
