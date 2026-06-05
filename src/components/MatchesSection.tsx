import type { Match } from "../api/types";
import type { Player } from "../lib/sweepstakes";
import { MatchCard } from "./MatchCard";

interface Props {
  title: string;
  matches: Match[];
  ownersByCode: Map<string, Player[]>;
}

// Section heading styled as a "fight card" banner: navy bar with stars
// on either side and the title in heavy slab varsity caps.
export function MatchesSection({ title, matches, ownersByCode }: Props) {
  if (matches.length === 0) return null;
  return (
    <section className="border-4 border-usa-navy dark:border-usa-cream bg-usa-cream dark:bg-usa-navy-deep shadow-[6px_6px_0_#B22234]">
      <div className="bg-usa-navy dark:bg-usa-red text-usa-cream px-4 py-2 flex items-center justify-between border-b-4 border-usa-red dark:border-usa-cream">
        <span className="font-display uppercase text-xl sm:text-2xl leading-none flex items-center gap-2">
          <span className="text-usa-gold">★</span>
          {title}
          <span className="text-usa-gold">★</span>
        </span>
        <span className="font-stencil text-[10px] sm:text-xs uppercase tracking-huge opacity-80">
          {matches.length} · ON THE CARD
        </span>
      </div>
      <div className="divide-y-2 divide-dashed divide-usa-navy/20 dark:divide-usa-cream/15">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} ownersByCode={ownersByCode} />
        ))}
      </div>
      <div aria-hidden className="h-1.5 bunting" />
    </section>
  );
}
