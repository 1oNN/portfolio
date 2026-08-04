import SectionHeader from "@/components/ui/SectionHeader";
import ContactForm from "@/components/sections/ContactForm";
import { SOCIAL_LINKS } from "@/lib/constants";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

const iconMap: Record<string, React.ReactNode> = {
  FiGithub: <FiGithub size={18} />,
  FiLinkedin: <FiLinkedin size={18} />,
  FiMail: <FiMail size={18} />,
};

const EMAIL = "hammadahmad.ml@gmail.com";

export default function Contact() {
  return (
    <section id="contact" className="hairline-accent">
      <div className="animate-reveal py-14 sm:py-16">
        <SectionHeader
          size="lg"
          eyebrow="Contact"
          title="Get in touch"
          description="Whether it's a research opportunity, an interesting engineering problem, or just a hello - I'd love to hear from you."
        />

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          {/* Info */}
          <div>
            {/* Availability signal */}
            <div
              className="inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                  style={{ backgroundColor: "var(--success)" }}
                />
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ backgroundColor: "var(--success)" }}
                />
              </span>
              <span className="font-mono text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
                Available for work
              </span>
            </div>

            <p className="mt-6 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              I&apos;m open to full-time AI/ML engineering and research roles, and MSCA-eligible for
              PhD or postdoc positions in the EU later this year.
            </p>

            {/* Primary CTA - solid accent, the loudest element in the section */}
            <a
              href={`mailto:${EMAIL}`}
              className="mt-8 inline-flex items-center gap-2.5 rounded-lg bg-[var(--accent)] px-5 py-3 font-mono text-sm font-semibold text-[var(--accent-contrast)] transition-opacity hover:opacity-90 focus-visible:opacity-90"
            >
              <FiMail size={15} />
              {EMAIL}
            </a>

            <p className="mt-4 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              Bradford, UK · open to relocation · replies within a day
            </p>

            {/* Social links - quiet icon buttons, pure CSS hover/focus twins */}
            <div className="mt-10">
              <p
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                Find me online
              </p>
              <div className="mt-3 flex gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target={link.platform !== "Email" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors duration-200 hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:border-[var(--text-secondary)] focus-visible:text-[var(--text-primary)]"
                  >
                    {iconMap[link.icon]}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form island */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
