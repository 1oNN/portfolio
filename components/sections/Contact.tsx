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
    <section id="contact" className="border-t" style={{ borderColor: "var(--border)" }}>
      <div className="py-14 sm:py-16">
        <SectionHeader
          eyebrow="Contact"
          title="Get in touch"
          description="Whether it's a research opportunity, an interesting engineering problem, or just a hello — I'd love to hear from you."
        />

        <div className="mt-10 space-y-12">
          {/* Info */}
          <div>
            <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              I&apos;m open to full-time AI/ML engineering and research roles, and MSCA-eligible for
              PhD or postdoc positions in the EU later this year.
            </p>

            <dl className="mt-8 space-y-5">
              <div className="space-y-1">
                <dt
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  Location
                </dt>
                <dd className="text-sm font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
                  Bradford, UK (open to relocation)
                </dd>
              </div>

              <div className="space-y-1">
                <dt
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  Email
                </dt>
                <dd>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="font-mono text-sm text-[var(--accent)] underline-offset-2 hover:underline focus-visible:underline"
                  >
                    {EMAIL}
                  </a>
                </dd>
              </div>
            </dl>

            {/* Social links — quiet icon buttons, pure CSS hover/focus twins */}
            <div className="mt-8">
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
