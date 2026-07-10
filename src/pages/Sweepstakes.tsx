import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { MatchesSection } from "../components/MatchesSection";
import { StandingsTable } from "../components/StandingsTable";
import { DEFAULT_LEAGUE_ID } from "../lib/league";
import { useSweepstakes } from "../hooks/useSweepstakes";
import { computePlayerStandings, type Player, type ScoringMode } from "../lib/sweepstakes";

export function Sweepstakes() {
  const params = useParams<{ league?: string }>();
  const groupId = params.league ?? DEFAULT_LEAGUE_ID;
  const { players, snapshot, loading, error } = useSweepstakes(groupId);
  const [scoringMode, setScoringMode] = useState<ScoringMode>("all");

  const playerStandings = useMemo(() => {
    if (!players || !snapshot) return [];
    return computePlayerStandings(players, snapshot.standings, snapshot.matches, scoringMode);
  }, [players, snapshot, scoringMode]);

  const ownersByCode = useMemo(() => {
    const map = new Map<string, Player[]>();
    if (!players) return map;
    for (const p of players) {
      for (const code of p.teams) {
        const list = map.get(code) ?? [];
        list.push(p);
        map.set(code, list);
      }
    }
    return map;
  }, [players]);

  const { live, upcoming } = useMemo(() => {
    const all = snapshot?.matches ?? [];
    return {
      live: all
        .filter((m) => m.status === "live")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      upcoming: all
        .filter((m) => m.status === "upcoming")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };
  }, [snapshot]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header fetchedAt={snapshot?.fetchedAt ?? null} />
      <main className="flex-1 max-w-3xl w-full mx-auto px-3 sm:px-4 pt-5 sm:pt-7 pb-10 space-y-6 sm:space-y-7">
        {error && (
          <div className="border-2 border-usa-red bg-usa-red/10 text-usa-red px-3 py-2 font-stencil uppercase tracking-wider text-xs">
            ⚠ {error}
          </div>
        )}
        {loading && !snapshot ? (
          <p className="font-stencil uppercase tracking-huge text-xs opacity-60">⟳ Loading the Republic…</p>
        ) : (
          <>
            <ScoringModeToggle mode={scoringMode} onModeChange={setScoringMode} />
            <StandingsTable rows={playerStandings} league={groupId} />
            <MatchesSection title="LIVE NOW" matches={live} ownersByCode={ownersByCode} />
            <MatchesSection title="ON THE HORIZON" matches={upcoming} ownersByCode={ownersByCode} />
          </>
        )}
      </main>
      <footer className="mt-4">
        <div aria-hidden className="h-2 bunting" />
        <div className="bg-usa-navy text-usa-cream py-3 px-4 text-center">
          <div className="font-western text-base sm:text-lg tracking-wider text-usa-gold">
            ★ Home of the Brave · Land of the Free ★
          </div>
          <div className="font-stencil text-[10px] uppercase tracking-huge mt-1 opacity-70">
            Sanctioned by the Sweepstakes Bureau · MMXXVI
          </div>
        </div>
        <div aria-hidden className="h-2 bunting" />
      </footer>
    </div>
  );
}

function ScoringModeToggle({
  mode,
  onModeChange,
}: {
  mode: ScoringMode;
  onModeChange: (mode: ScoringMode) => void;
}) {
  return (
    <div className="flex justify-end">
      <div
        className="inline-grid w-full xs:w-auto grid-cols-2 border-2 border-usa-navy dark:border-usa-cream bg-usa-cream dark:bg-usa-navy-deep shadow-[3px_3px_0_#B22234]"
        role="group"
        aria-label="Scoring mode"
      >
        <ScoringButton
          active={mode === "all"}
          onClick={() => onModeChange("all")}
        >
          All matches
        </ScoringButton>
        <ScoringButton
          active={mode === "group"}
          onClick={() => onModeChange("group")}
        >
          Group stage
        </ScoringButton>
      </div>
    </div>
  );
}

function ScoringButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-10 min-w-0 px-2.5 sm:px-4 py-2 font-stencil uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-usa-gold ${
        active
          ? "bg-usa-red text-usa-cream"
          : "text-usa-navy dark:text-usa-cream hover:bg-usa-navy/10 dark:hover:bg-usa-cream/10"
      }`}
    >
      {children}
    </button>
  );
}
