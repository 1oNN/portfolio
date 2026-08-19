import DedupeKeyExplorer from "./embeds/DedupeKeyExplorer";
import FacetCountExplorer from "./embeds/FacetCountExplorer";
import MatchPathExplorer from "./embeds/MatchPathExplorer";

/**
 * Every embed a post body may reference by `[[embed:id]]`.
 *
 * Kept as a closed map rather than a dynamic import path: post bodies come out
 * of DynamoDB, so an id from a post is untrusted input and must never be able to
 * name a module. An unknown id renders nothing.
 *
 * These are ordinary client components, not `ssr: false` ones, so the prose and
 * the data around them are in the server HTML too.
 */
const EMBEDS: Record<string, React.ComponentType> = {
  "dedupe-key": DedupeKeyExplorer,
  "facet-counts": FacetCountExplorer,
  "match-paths": MatchPathExplorer,
};

export default function PostEmbed({ id }: { id: string }) {
  const Embed = EMBEDS[id];
  if (!Embed) return null;
  return <Embed />;
}
