import Link from "next/link";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { SOCIAL_LINKS } from "@/lib/constants";

const iconMap: Record<string, React.ReactNode> = {
  FiGithub: <FiGithub size={16} />,
  FiLinkedin: <FiLinkedin size={16} />,
  FiMail: <FiMail size={16} />,
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
    >
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Row 1 — logo + tagline, social links */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-mono text-sm font-semibold tracking-tight transition-opacity hover:opacity-70 focus-visible:opacity-70"
              style={{ color: "var(--accent)" }}
              aria-label="Home"
            >
              ha<span style={{ color: "var(--accent-secondary)" }}>.</span>
            </Link>
            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              AI/ML engineer & researcher — Bradford, UK
            </span>
          </div>

          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target={link.platform !== "Email" ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={link.platform}
                className="transition-colors text-[var(--text-muted)] hover:text-[var(--accent)] focus-visible:text-[var(--accent)]"
              >
                {iconMap[link.icon]}
              </a>
            ))}
          </div>
        </div>

        {/* Row 2 — copyright, back to top */}
        <div
          className="mt-6 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © {year} Hammad Ahmad. All rights reserved.
          </p>
          <a
            href="#hero"
            className="font-mono text-xs transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
