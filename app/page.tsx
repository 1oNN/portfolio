import type { Metadata } from "next";
import { PUBLICATIONS, ORCID_URL } from "@/lib/constants";
import { toJsonLd } from "@/lib/json-ld";
import LeftRail from "@/components/layout/LeftRail";
import Footer from "@/components/layout/Footer";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import HomeProjects from "@/components/sections/HomeProjects";
import AgentSection from "@/components/sections/AgentSection";
import Publications from "@/components/sections/Publications";
import Contact from "@/components/sections/Contact";
import TerminalLauncher from "@/components/interactive/TerminalLauncher";
import AnalyticsBeacon from "@/components/interactive/AnalyticsBeacon";

// Title and description inherit from the root layout; only the canonical is
// page-specific (see the note in app/projects/page.tsx on why canonicals are
// never set at the root).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.co.uk";

// ScholarlyArticle for the peer-reviewed paper, scoped to this page because
// this is where the citation is rendered (the Person schema lives in the root
// layout and applies sitewide). Title/year/DOI are derived from PUBLICATIONS so
// they cannot drift from the visible citation; the co-author names, proceedings
// volume and page range are the ones Crossref records against the DOI, which the
// display string only carries in abbreviated form.
const publicationLd = PUBLICATIONS.map((pub) => ({
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  headline: pub.title,
  name: pub.title,
  datePublished: pub.year,
  pagination: "3-15",
  isPartOf: {
    "@type": "Book",
    name: "Advances in Smart Medical, IoT & Artificial Intelligence",
    isPartOf: { "@type": "BookSeries", name: "Information Systems Engineering and Management" },
  },
  publisher: { "@type": "Organization", name: "Springer Nature" },
  author: [
    { "@type": "Person", name: "Hammad Ahmad", url: SITE_URL, sameAs: ORCID_URL },
    { "@type": "Person", name: "M. Umar Khan" },
    { "@type": "Person", name: "Maleeha Azam" },
  ],
  ...(pub.doi
    ? { identifier: { "@type": "PropertyValue", propertyID: "DOI", value: pub.doi }, url: `https://doi.org/${pub.doi}` }
    : {}),
}));

export default function HomePage() {
  return (
    <>
      {publicationLd.map((ld) => (
        <script
          key={ld.headline}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(ld) }}
        />
      ))}

      {/* Page-level atmosphere: grid fading from the top-left + accent wash */}
      <div
        className="grid-bg pointer-events-none fixed inset-0 opacity-40 [mask-image:radial-gradient(ellipse_70%_50%_at_20%_0%,black,transparent_65%)]"
        aria-hidden="true"
      />
      <div
        className="animate-glow-drift pointer-events-none fixed inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 20% -5%, var(--accent-glow), transparent)",
        }}
      />
      {/* Counter-glow: secondary accent, fainter, anchored opposite the primary */}
      <div
        className="animate-glow-drift-slow pointer-events-none fixed inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 50% 38% at 85% 105%, color-mix(in srgb, var(--accent-secondary) 10%, transparent), transparent)",
        }}
      />

      <div className="relative mx-auto min-h-screen max-w-6xl px-6 md:px-10 lg:flex lg:justify-between lg:gap-10">
        <LeftRail />
        <main id="main" className="pb-16 lg:w-[54%] lg:py-24">
          <About />
          <Experience />
          <HomeProjects />
          <AgentSection />
          <Publications />
          <Contact />
        </main>
      </div>
      <Footer />
      <TerminalLauncher />
      <AnalyticsBeacon />
    </>
  );
}
