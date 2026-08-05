import ContactForm from "@/components/sections/ContactForm";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/constants";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

const iconMap: Record<string, React.ReactNode> = {
  FiGithub: <FiGithub size={18} />,
  FiLinkedin: <FiLinkedin size={18} />,
  FiMail: <FiMail size={18} />,
};

const EMAIL = CONTACT_EMAIL;

/**
 * Closing section: a centered statement with ONE dominant CTA (the email),
 * the form demoted to a clearly secondary path below a labelled divider.
 * Deliberately centered - the only centered section on the page, marking
 * the end of the scroll.
 */
export default function Contact() {
  return (
    <section id="contact" className="hairline-accent">
      <div className="animate-reveal py-16 text-center sm:py-20">
        <span
          className="font-mono text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--accent)" }}
        >
          Contact
        </span>

        <h2
          className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl"
          style={{ color: "var(--text-primary)" }}
        >
          Get in touch
        </h2>

        <p
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          I&apos;m open to full-time AI/ML engineering and research roles, and MSCA-eligible for
          PhD or postdoc positions in the EU. If you&apos;re hiring for an AI/ML team, supervising
          research, or just want to compare notes on retrieval systems, email is the fastest way
          to reach me.
        </p>

        {/* The one dominant CTA */}
        <a
          href={`mailto:${EMAIL}`}
          className="mt-9 inline-flex items-center gap-2.5 rounded-lg bg-[var(--accent)] px-6 py-3.5 font-mono text-sm font-semibold text-[var(--accent-contrast)] transition-opacity hover:opacity-90 focus-visible:opacity-90"
        >
          <FiMail size={15} />
          {EMAIL}
        </a>

        {/* Meta line: availability pulse + location + response time */}
        <p
          className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="relative inline-flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: "var(--success)" }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: "var(--success)" }}
            />
          </span>
          <span style={{ color: "var(--text-secondary)" }}>Available for work</span>
          <span aria-hidden="true">·</span>
          <span>Bradford, UK · open to relocation · replies within a day</span>
        </p>

        {/* Socials - quiet icon row */}
        <div className="mt-8 flex justify-center gap-3">
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

        {/* Labelled divider into the secondary path */}
        <div className="mx-auto mt-14 flex max-w-lg items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
          <span
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            or send a message from here
          </span>
          <span className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
        </div>

        {/* Form island - centered, secondary */}
        <div className="mx-auto mt-8 max-w-lg text-left">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
