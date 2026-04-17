import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { SOCIAL_LINKS } from "@/lib/constants";

const iconMap: Record<string, React.ReactNode> = {
  FiGithub: <FiGithub size={18} />,
  FiLinkedin: <FiLinkedin size={18} />,
  FiMail: <FiMail size={18} />,
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t py-10"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
    >
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          © {year} Hammad Ahmad. Built with Next.js.
        </p>

        <div className="flex items-center gap-3">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target={link.platform !== "Email" ? "_blank" : undefined}
              rel="noopener noreferrer"
              aria-label={link.platform}
              className="flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 hover:scale-105"
              style={{
                color: "var(--text-secondary)",
                borderColor: "var(--border)",
                backgroundColor: "var(--surface-elevated)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--accent-muted)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
              }}
            >
              {iconMap[link.icon]}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
