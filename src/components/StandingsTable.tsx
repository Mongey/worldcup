import type { PlayerStanding } from "../lib/sweepstakes";
import { Avatar } from "./Avatar";
import { Flag } from "./Flag";

interface Props {
  rows: PlayerStanding[];
}

// The leaderboard, dressed up as a stadium scoreboard / propaganda poster.
// Section heading sits in a red banner; #1 wears a gold-star rank chip.
export function StandingsTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="text-sm opacity-60 px-4 font-sans">
        No players yet — drop a sweepstakes JSON into <code>public/players/</code>.
      </p>
    );
  }

  return (
    <section className="border-4 border-usa-navy dark:border-usa-cream bg-usa-cream dark:bg-usa-navy-deep shadow-[6px_6px_0_#B22234] overflow-hidden">
      {/* Section banner */}
      <div className="bg-usa-red text-usa-cream px-3 sm:px-4 py-2 flex items-center justify-between gap-3 border-b-4 border-usa-navy dark:border-usa-cream">
        <span className="font-display uppercase text-base sm:text-2xl leading-none min-w-0">
          ★ Leaderboard of the Free ★
        </span>
        <span className="font-stencil text-[9px] sm:text-xs uppercase tracking-huge opacity-90 whitespace-nowrap">
          OFFICIAL · BINDING
        </span>
      </div>

      <table className="w-full text-left table-fixed">
        <thead className="bg-usa-navy text-usa-cream">
          <tr className="font-stencil text-[10px] uppercase tracking-wider">
            <th className="px-1 sm:px-2 py-2 w-9 sm:w-10 text-center">RNK</th>
            <th className="px-1 sm:px-2 py-2" colSpan={2}>PATRIOT · TEAMS</th>
            <th className="px-1 py-2 text-center w-8 sm:w-9 hidden min-[600px]:table-cell">MP</th>
            <th className="px-1 py-2 text-center w-7 sm:w-8 hidden min-[380px]:table-cell">W</th>
            <th className="px-1 py-2 text-center w-7 sm:w-8 hidden min-[520px]:table-cell">D</th>
            <th className="px-1 py-2 text-center w-7 sm:w-8 hidden min-[440px]:table-cell">L</th>
            <th className="px-1 py-2 text-center w-10 hidden min-[720px]:table-cell">GD</th>
            <th className="px-2 sm:px-3 py-2 text-right w-12 sm:w-14 text-usa-gold">PTS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const rank = idx + 1;
            const isFirst = rank === 1;
            const live = row.hasLiveMatch;
            const rowBg = live
              ? "bg-usa-red/10 dark:bg-usa-red/20"
              : idx % 2 === 1
                ? "bg-usa-navy/[0.04] dark:bg-usa-cream/[0.035]"
                : "";
            return (
              <tr
                key={row.player.name}
                className={`border-t-2 border-dashed border-usa-navy/20 dark:border-usa-cream/15 ${rowBg}`}
              >
                {/* Rank chip — gold star for #1, navy ring otherwise */}
                <td className="px-2 py-3 text-center align-middle">
                  <RankChip rank={rank} isFirst={isFirst} live={live} />
                </td>

                {/* Player */}
                <td className="pl-1 sm:pl-2 pr-1 py-3 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                    {row.player.image && (
                      <Avatar
                        src={row.player.image}
                        alt={row.player.name}
                        className={`w-7 h-7 sm:w-10 sm:h-10 shrink-0 ring-2 ${
                          isFirst
                            ? "ring-usa-gold"
                            : "ring-usa-navy/30 dark:ring-usa-cream/30"
                        }`}
                      />
                    )}
                    <span
                      className={`font-display uppercase text-xs min-[380px]:text-sm sm:text-xl leading-tight break-words min-w-0 ${
                        isFirst
                          ? "text-usa-red"
                          : "text-usa-navy dark:text-usa-cream"
                      }`}
                    >
                      {row.player.name}
                    </span>
                  </div>
                </td>

                {/* Flags */}
                <td className="px-1 sm:px-2 py-3">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                    {row.teams.map((t) => (
                      <Flag
                        key={t.code}
                        code={t.code}
                        className={`h-4 sm:h-6 w-auto ${
                          t.isLive ? "ring-2 ring-usa-red animate-siren" : ""
                        }`}
                      />
                    ))}
                  </div>
                </td>

                {/* Stat cells — chunky stencil. Hide order from narrowest up:
                    MP drops first, then D, then L, then W. GD is the last to appear. */}
                <td className="px-1 py-3 text-center font-stencil tab-num text-sm text-usa-navy/80 dark:text-usa-cream/80 hidden min-[600px]:table-cell">
                  {row.played}
                </td>
                <td className="px-1 py-3 text-center font-stencil tab-num text-sm text-usa-navy/80 dark:text-usa-cream/80 hidden min-[380px]:table-cell">
                  {row.won}
                </td>
                <td className="px-1 py-3 text-center font-stencil tab-num text-sm text-usa-navy/80 dark:text-usa-cream/80 hidden min-[520px]:table-cell">
                  {row.drawn}
                </td>
                <td className="px-1 py-3 text-center font-stencil tab-num text-sm text-usa-navy/80 dark:text-usa-cream/80 hidden min-[440px]:table-cell">
                  {row.lost}
                </td>
                <td className="px-1 py-3 text-center font-stencil tab-num text-sm text-usa-navy/80 dark:text-usa-cream/80 hidden min-[720px]:table-cell">
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </td>

                {/* Big freedom points — outsized varsity numerals */}
                <td className="px-2 sm:px-3 py-3 text-right font-display tab-num text-xl sm:text-3xl leading-none">
                  <span
                    className={
                      isFirst
                        ? "text-usa-red"
                        : "text-usa-navy dark:text-usa-cream"
                    }
                  >
                    {row.points}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Bottom rule: small bunting stripe */}
      <div aria-hidden className="h-1.5 bunting" />
    </section>
  );
}

function RankChip({ rank, isFirst, live }: { rank: number; isFirst: boolean; live: boolean }) {
  if (isFirst) {
    return (
      <span
        title="1st"
        className="inline-flex relative items-center justify-center w-9 h-9 mx-auto"
      >
        <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full text-usa-gold" aria-hidden>
          <polygon
            fill="currentColor"
            stroke="#3C3B6E"
            strokeWidth="1"
            strokeLinejoin="round"
            points="12,2 14.9,9 22.5,9 16.3,13.7 18.7,21 12,16.6 5.3,21 7.7,13.7 1.5,9 9.1,9"
          />
        </svg>
        <span className="relative font-display text-usa-navy text-base leading-none drop-shadow-sm">1</span>
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 mx-auto rounded-full border-2 font-display text-base leading-none ${
        live
          ? "border-usa-red text-usa-red"
          : "border-usa-navy/40 dark:border-usa-cream/40 text-usa-navy dark:text-usa-cream"
      }`}
    >
      {rank}
    </span>
  );
}
