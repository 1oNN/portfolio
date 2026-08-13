import type { Metadata } from "next";
import { PUBLICATIONS, ORCID_URL } from "@/lib/constants";
import { toJsonLd } from "@/lib/json-ld";
import { pageOpenGraph, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/metadata";
import LeftRail from "@/components/layout/LeftRail";
import Footer from "@/components/layout/Footer";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import HomeProjects from "@/components/sections/HomeProjects";
import HomeWriting from "@/components/sections/HomeWriting";
import AgentSection from "@/components/sections/AgentSection";
import Publications from "@/components/sections/Publications";
import Contact from "@/components/sections/Contact";
import AgentConsoleLauncher from "@/components/interactive/AgentConsoleLauncher";
import IntroOverlay from "@/components/interactive/IntroOverlay";
import AnalyticsBeacon from "@/components/interactive/AnalyticsBeacon";

// Title and description inherit from the root layout; the canonical and the
// openGraph block are page-specific (see the note in app/projects/page.tsx on
// why canonicals are never set at the root, and lib/metadata.ts on why every
// page has to restate the whole openGraph object).
// The home page now reads published posts for the Writing section, so it is
// ISR rather than fully static - still served from the CDN, revalidated every
// five minutes so a newly published post surfaces without a rebuild.
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: pageOpenGraph({
    path: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  }),
};

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
    editor: [
      { "@type": "Person", name: "Serrhini" },
      { "@type": "Person", name: "Ghoumid" },
    ],
    isPartOf: {
      "@type": "BookSeries",
      name: "Information Systems Engineering and Management",
      volumeNumber: "12",
    },
  },
  publisher: { "@type": "Organization", name: "Springer", location: "Cham" },
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
          <Skills />
          <Experience />
          <HomeProjects />
          <HomeWriting />
          <AgentSection />
          <Publications />
          <Contact />
        </main>
      </div>
      <Footer />
      <AgentConsoleLauncher />
      <IntroOverlay />
      <AnalyticsBeacon />
    </>
  );
}
