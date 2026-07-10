import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { MatchesSection } from "../components/MatchesSection";
import { Flag } from "../components/Flag";
import { Avatar } from "../components/Avatar";
import { useSweepstakes } from "../hooks/useSweepstakes";
import { DEFAULT_LEAGUE_ID } from "../lib/league";
import { findPlayerBySlug } from "../lib/person";
import { computePlayerStandings, type Player } from "../lib/sweepstakes";
import type { Match } from "../api/types";

function sortByDateAsc(a: Match, b: Match): number {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

function sortByDateDesc(a: Match, b: Match): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

export function PersonFixtures() {
  const params = useParams<{ league?: string; user?: string }>();
  const league = params.league ?? DEFAULT_LEAGUE_ID;
  const user = params.user ?? "";
  const { players, snapshot, loading, error } = useSweepstakes(league);

  const player = useMemo(() => findPlayerBySlug(players, user), [players, user]);

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

  const teamSet = useMemo(() => {
    const set = new Set<string>();
    if (!player) return set;
    for (const code of player.teams) set.add(code);
    return set;
  }, [player]);

  const playerMatches = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.matches.filter((m) => {
      if (m.home && teamSet.has(m.home.code)) return true;
      if (m.away && teamSet.has(m.away.code)) return true;
      return false;
    });
  }, [snapshot, teamSet]);

  const { live, upcoming, finished } = useMemo(() => {
    const live = [];
    const upcoming = [];
    const finished = [];
    for (const match of playerMatches) {
      if (match.status === "live") live.push(match);
      else if (match.status === "upcoming") upcoming.push(match);
      else finished.push(match);
    }

    return {
      live: live.sort(sortByDateAsc),
      upcoming: upcoming.sort(sortByDateAsc),
      finished: finished.sort(sortByDateDesc),
    };
  }, [playerMatches]);

  const playerStanding = useMemo(() => {
    if (!snapshot || !player) return null;
    const [standing] = computePlayerStandings([player], snapshot.standings, snapshot.matches, "all");
    return standing ?? null;
  }, [snapshot, player]);

  const teamsByPoints = useMemo(
    () => [...(playerStanding?.teams ?? [])].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference),
    [playerStanding],
  );
  const highestTeamPoints = teamsByPoints[0]?.points ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header fetchedAt={snapshot?.fetchedAt ?? null} />
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 pt-5 sm:pt-7 pb-10 space-y-6 sm:space-y-7">
        {error && (
          <div className="border-2 border-usa-red bg-usa-red/10 text-usa-red px-3 py-2 font-stencil uppercase tracking-wider text-xs">
            ⚠ {error}
          </div>
        )}

        {loading && !snapshot ? (
          <p className="font-stencil uppercase tracking-huge text-xs opacity-60">⟳ Loading the Republic…</p>
        ) : player ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <Link
                to={`/${league}`}
                className="-ml-2 py-2 px-2 font-stencil text-[11px] sm:text-xs uppercase tracking-huge text-usa-navy dark:text-usa-cream hover:text-usa-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-usa-red"
              >
                ← Back to league table
              </Link>
              <span className="hidden xs:inline text-xs font-stencil uppercase tracking-huge opacity-65">
                League · {league}
              </span>
            </div>

            <section className="border-4 border-usa-navy dark:border-usa-cream bg-usa-cream dark:bg-usa-navy-deep shadow-[7px_7px_0_#B22234] overflow-hidden">
              <div className="relative bg-usa-navy text-usa-cream px-4 sm:px-5 py-4 sm:py-5 overflow-hidden">
                <div aria-hidden className="absolute -right-4 -top-5 text-[11rem] sm:text-[14rem] font-display leading-none text-usa-cream/[0.06] select-none">★</div>
                <div className="relative grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-x-3 sm:gap-x-5 items-center">
                  <div className="shrink-0 border-2 border-usa-gold bg-usa-red p-1 shadow-[3px_3px_0_#FBF5E5]">
                    <Avatar src={player.image} alt={player.name} className="h-14 w-14 sm:h-20 sm:w-20 object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-stencil text-[9px] sm:text-[10px] uppercase tracking-huge text-usa-gold mb-1">Player dossier</p>
                    <h2 className="font-display text-2xl sm:text-4xl uppercase leading-[0.88] break-words">{player.name}</h2>
                    <p className="font-stencil text-[10px] sm:text-xs uppercase tracking-wider text-usa-cream/70 mt-2">Fixtures, results &amp; team return</p>
                  </div>
                  {playerStanding && (
                    <div className="col-span-2 sm:col-span-1 sm:row-span-1 mt-3 sm:mt-0 sm:text-right border-t-2 sm:border-t-0 sm:border-l-2 border-usa-cream/25 pt-2 sm:pt-0 sm:pl-5">
                      <div className="font-display tab-num text-5xl sm:text-6xl leading-[0.75] text-usa-gold">{playerStanding.points}</div>
                      <div className="font-stencil text-[10px] uppercase tracking-huge text-usa-cream/75 mt-2">Total points</div>
                    </div>
                  )}
                </div>
              </div>

              {playerStanding && (
                <div className="grid grid-cols-4 divide-x-2 divide-usa-navy/15 dark:divide-usa-cream/15 border-y-4 border-usa-red dark:border-usa-cream bg-usa-gold/15 text-usa-navy dark:text-usa-cream">
                  {[
                    ["Played", playerStanding.played],
                    ["Won", playerStanding.won],
                    ["Drawn", playerStanding.drawn],
                    ["Goals", `${playerStanding.goalsFor}:${playerStanding.goalsAgainst}`],
                  ].map(([label, value]) => (
                    <div key={label} className="px-2 sm:px-4 py-2.5 sm:py-3 text-center">
                      <div className="font-display tab-num text-xl sm:text-3xl leading-none">{value}</div>
                      <div className="font-stencil text-[8px] sm:text-[10px] uppercase tracking-wider opacity-70 mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 sm:p-5">
                <div className="flex items-end justify-between gap-3 pb-3 border-b-2 border-usa-navy/20 dark:border-usa-cream/20">
                  <div>
                    <p className="font-stencil text-[10px] uppercase tracking-huge text-usa-red">The point ledger</p>
                    <h3 className="font-display text-xl sm:text-2xl uppercase leading-none mt-1 text-usa-navy dark:text-usa-cream">Points by team</h3>
                  </div>
                  <span className="font-stencil text-[10px] uppercase tracking-wider text-right opacity-65">{teamsByPoints.length} teams</span>
                </div>

                <div className="mt-3 space-y-2">
                  {teamsByPoints.map((team, index) => {
                    const contribution = highestTeamPoints > 0 ? (team.points / highestTeamPoints) * 100 : 0;
                    return (
                      <article key={team.code} className="relative grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-x-2.5 sm:gap-x-4 border-2 border-usa-navy/20 dark:border-usa-cream/20 bg-usa-navy/[0.035] dark:bg-usa-cream/[0.04] px-2.5 sm:px-3 py-2.5 overflow-hidden">
                        <div aria-hidden className="absolute inset-y-0 left-0 w-1 bg-usa-red" />
                        <div className="font-stencil text-[10px] tab-num text-usa-navy/55 dark:text-usa-cream/55 w-4 text-center">{index + 1}</div>
                        <Flag code={team.code} className="h-7 sm:h-9 w-auto ring-2 ring-usa-navy/25 dark:ring-usa-cream/25" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <h4 className="font-display uppercase text-base sm:text-xl leading-none truncate text-usa-navy dark:text-usa-cream">{team.name}</h4>
                            {team.isLive && <span className="font-stencil text-[8px] uppercase tracking-wider bg-usa-red text-usa-cream px-1.5 py-0.5 animate-siren motion-reduce:animate-none">Live</span>}
                          </div>
                          <div className="mt-1.5 h-1.5 bg-usa-navy/15 dark:bg-usa-cream/15 overflow-hidden" aria-label={`${team.points} points, highest team return is ${highestTeamPoints}`}>
                            <div className="h-full bg-usa-red" style={{ width: `${contribution}%` }} />
                          </div>
                          <p className="font-stencil text-[9px] sm:text-[10px] uppercase tracking-wider text-usa-navy/65 dark:text-usa-cream/65 mt-1 leading-relaxed">{team.played} played · {team.won}W {team.drawn}D {team.lost}L · {team.goalsFor}:{team.goalsAgainst} goals</p>
                        </div>
                        <div className="self-stretch flex flex-col justify-center text-right border-l border-usa-navy/20 dark:border-usa-cream/20 pl-2 sm:pl-4">
                          <div className="font-display tab-num text-3xl sm:text-4xl leading-[0.8] text-usa-red">{team.points}</div>
                          <div className="font-stencil text-[8px] sm:text-[9px] uppercase tracking-wider opacity-65 mt-1">Points</div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>

            <div className="flex items-center gap-3 pt-1">
              <span aria-hidden className="h-0.5 flex-1 bg-usa-red" />
              <h2 className="font-stencil text-[10px] sm:text-xs uppercase tracking-huge text-usa-navy dark:text-usa-cream">Match board</h2>
              <span aria-hidden className="h-0.5 flex-1 bg-usa-red" />
            </div>

            {live.length === 0 && upcoming.length === 0 && finished.length === 0 && (
              <p className="font-stencil uppercase tracking-huge text-xs opacity-60">
                No fixtures or results found for this person yet.
              </p>
            )}

            <MatchesSection title="LIVE NOW" matches={live} ownersByCode={ownersByCode} />
            <MatchesSection title="UPCOMING FIXTURES" matches={upcoming} ownersByCode={ownersByCode} />
            <MatchesSection title="RESULTS" matches={finished} ownersByCode={ownersByCode} />
          </>
        ) : (
          <p className="font-stencil uppercase tracking-huge text-xs opacity-60">
            Could not find person "{decodeURIComponent(user)}" in league {league}.
          </p>
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
