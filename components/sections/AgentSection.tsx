import SectionHeader from "@/components/ui/SectionHeader";
import TerminalAgent from "@/components/interactive/TerminalAgent";

export default function AgentSection() {
  return (
    <section id="agent" className="border-t" style={{ borderColor: "var(--border)" }}>
      <div className="py-14 sm:py-16">
        <SectionHeader
          eyebrow="Ask the agent"
          title="Chat with my portfolio"
          description="A real LLM answers questions about my experience, projects, and research, grounded in my CV and rate-limited per session."
        />

        <div className="mt-10">
          <TerminalAgent />
        </div>
      </div>
    </section>
  );
}
