import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { MatchesSection } from "../components/MatchesSection";
import { StandingsTable } from "../components/StandingsTable";
import { useSweepstakes } from "../hooks/useSweepstakes";
import { computePlayerStandings, type Player } from "../lib/sweepstakes";

const DEFAULT_GROUP = import.meta.env.PROD ? "lucan" : "development";

export function Sweepstakes() {
  const params = useParams<{ id?: string }>();
  const groupId = params.id ?? DEFAULT_GROUP;
  const { players, snapshot, loading, error } = useSweepstakes(groupId);

  const playerStandings = useMemo(() => {
    if (!players || !snapshot) return [];
    return computePlayerStandings(players, snapshot.standings, snapshot.matches);
  }, [players, snapshot]);

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
            <StandingsTable rows={playerStandings} />
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
