import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { SiOrcid } from "react-icons/si";

/**
 * The one place that maps a SOCIAL_LINKS `icon` name to a glyph.
 *
 * This map was written out three times - in LeftRail, Contact and Footer -
 * identical apart from the icon size, so adding a fifth social link meant
 * editing three files or it silently rendered nothing at all.
 */
const ICONS = {
  FiGithub,
  FiLinkedin,
  SiOrcid,
  FiMail,
} as const;

export default function SocialIcon({ name, size }: { name: string; size: number }) {
  const Icon = ICONS[name as keyof typeof ICONS];
  return Icon ? <Icon size={size} /> : null;
}
