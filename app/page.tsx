import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import HomeProjects from "@/components/sections/HomeProjects";
import AgentSection from "@/components/sections/AgentSection";
import Publications from "@/components/sections/Publications";
import Contact from "@/components/sections/Contact";
import TerminalLauncher from "@/components/interactive/TerminalLauncher";
import AnalyticsBeacon from "@/components/interactive/AnalyticsBeacon";

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <HomeProjects />
        <AgentSection />
        <Publications />
        <Contact />
      </main>
      <Footer />
      <TerminalLauncher />
      <AnalyticsBeacon />
    </>
  );
}
