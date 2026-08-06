import type { Metadata } from "next";
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

export default function HomePage() {
  return (
    <>
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
