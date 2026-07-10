import type { Player } from "./sweepstakes";

const slugRegex = /[\u0300-\u036f]/g;

export function toPersonSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(slugRegex, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function findPlayerBySlug(players: Player[] | null, slug: string): Player | null {
  if (!players) return null;
  const normalized = slug.toLowerCase().trim();
  return (
    players.find((p) => toPersonSlug(p.name) === normalized) ??
    players.find((p) => p.name.toLowerCase() === normalized) ??
    null
  );
}
