import SectionHeader from "@/components/ui/SectionHeader";
import TerminalAgent from "@/components/interactive/TerminalAgent";

export default function AgentSection() {
  return (
    <section id="agent" className="hairline-accent">
      <div className="animate-reveal py-14 sm:py-16">
        <SectionHeader
          size="lg"
          eyebrow="Ask the agent"
          title="Chat with my portfolio"
          description="A real LLM answers questions about my experience, projects, and research, grounded in my CV and rate-limited per session."
        />

        <div className="mt-10">
          <TerminalAgent />
        </div>

        {/* Conversations are stored server-side, so say so rather than not. */}
        <p className="mt-4 font-mono text-[11px] text-[var(--text-muted)]">
          Conversations are logged so I can see what the agent tells people. Don&apos;t send
          anything confidential.
        </p>
      </div>
    </section>
  );
}
