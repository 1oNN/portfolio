import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { SiOrcid } from "react-icons/si";
import { SOCIAL_LINKS } from "@/lib/constants";

const iconMap: Record<string, React.ReactNode> = {
  FiGithub: <FiGithub size={15} />,
  FiLinkedin: <FiLinkedin size={15} />,
  SiOrcid: <SiOrcid size={15} />,
  FiMail: <FiMail size={15} />,
};

/**
 * Rendered on every public page, not only the home page. The profile links the
 * CV puts in its header previously existed on the site in exactly one place -
 * the home rail - so a visitor who landed on a case study or a blog post had
 * no route to GitHub, LinkedIn or ORCID at all. Labelled as well as iconised,
 * because an unlabelled ORCID glyph is not recognisable to most readers.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 font-mono text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between md:px-10">
        <p>© {year} Hammad Ahmad</p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target={link.platform !== "Email" ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--accent)] focus-visible:text-[var(--accent)]"
            >
              {iconMap[link.icon]}
              <span>{link.platform}</span>
            </a>
          ))}
          <a
            href="#top"
            className="transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
          >
            Top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
