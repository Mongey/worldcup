import type { Match } from "../api/types";
import { Avatar } from "./Avatar";
import { Flag } from "./Flag";
import type { Player } from "../lib/sweepstakes";

interface Props {
  match: Match;
  ownersByCode: Map<string, Player[]>;
}

const dayMonthFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "long",
  day: "numeric",
});
const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatDay(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dayMonthFmt.format(d).toUpperCase();
}
function formatTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : timeFmt.format(d);
}

function shortStage(stage: string): string {
  switch (stage) {
    case "Round of 32": return "RO 32";
    case "Round of 16": return "RO 16";
    case "Quarter-final": return "Quarter Final";
    case "Semi-final": return "Semi Final";
    case "Play-off for third place": return "Third Place";
    default: return stage;
  }
}

function computeWinner(m: Match): "home" | "away" | null {
  if (m.status !== "finished" || m.homeScore == null || m.awayScore == null) return null;
  if (m.homeScore > m.awayScore) return "home";
  if (m.awayScore > m.homeScore) return "away";
  if (m.homePens != null && m.awayPens != null) {
    if (m.homePens > m.awayPens) return "home";
    if (m.awayPens > m.homePens) return "away";
  }
  return null;
}

function TeamName({
  align,
  code,
  name,
  isWinner,
}: {
  align: "left" | "right";
  code: string | null;
  name: string | null;
  isWinner: boolean;
}) {
  const display = name ?? "TBD";
  const sizeCls = display.length > 16
    ? "text-base sm:text-lg"
    : display.length > 11
      ? "text-lg sm:text-xl"
      : "text-xl sm:text-2xl";
  return (
    <div
      className={`flex items-center gap-2.5 sm:gap-3 min-w-0 ${align === "right" ? "flex-row-reverse text-right" : ""}`}
    >
      {code ? (
        <Flag code={code} className="h-7 sm:h-8 w-auto shrink-0 ring-2 ring-usa-navy/20 dark:ring-usa-cream/20" />
      ) : (
        <span className="inline-block w-7 h-5 sm:w-9 sm:h-7 rounded-sm bg-usa-navy/15 dark:bg-usa-cream/15 shrink-0" />
      )}
      <span
        className={`font-display uppercase tracking-tight leading-[0.92] break-words ${sizeCls} ${
          isWinner ? "text-usa-red" : "text-usa-navy dark:text-usa-cream"
        }`}
      >
        {display}
      </span>
    </div>
  );
}

// A match row done up like a boxing fight card: stage / status badge sits
// inside a navy chevron, score is in oversized varsity numerals, and a
// LIVE match gets a red bunting rail down the left and a pulsing siren chip.
export function MatchCard({ match, ownersByCode }: Props) {
  const homeOwners = match.home ? (ownersByCode.get(match.home.code) ?? []) : [];
  const awayOwners = match.away ? (ownersByCode.get(match.away.code) ?? []) : [];
  const winner = computeWinner(match);
  const stageLabel = match.group ?? shortStage(match.stage);
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  return (
    <article
      className={`relative pl-4 sm:pl-5 pr-3 sm:pr-4 py-4 ${
        isLive ? "bg-usa-red/[0.08] dark:bg-usa-red/15" : ""
      }`}
    >
      {/* Left rail: bunting on live, navy on finished, dashed on upcoming */}
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-1.5 ${
          isLive
            ? "bunting-v animate-pulse"
            : isFinished
              ? "bg-usa-navy dark:bg-usa-cream/60"
              : "bg-transparent border-l-2 border-dashed border-usa-navy/40 dark:border-usa-cream/40"
        }`}
      />

      {/* Top row: team names + center stage/status badge */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <TeamName
          align="left"
          code={match.home?.code ?? null}
          name={match.home?.name ?? null}
          isWinner={winner === "home"}
        />
        <div className="flex flex-col items-center gap-1.5 min-w-[5rem] sm:min-w-[7rem]">
          {stageLabel && (
            <span className="font-stencil bg-usa-navy text-usa-cream uppercase text-[10px] sm:text-xs tracking-huge px-2.5 py-1 whitespace-nowrap">
              {stageLabel}
            </span>
          )}
          {isLive ? (
            <span className="font-stencil bg-usa-red text-usa-cream px-2 py-0.5 text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-1.5 animate-siren">
              <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-usa-cream animate-pulse" />
              LIVE{match.minuteDisplay && match.minuteDisplay !== "0'" ? ` ${match.minuteDisplay}` : ""}
            </span>
          ) : isFinished ? (
            <span className="font-stencil text-[10px] sm:text-xs uppercase tracking-huge text-usa-navy/70 dark:text-usa-cream/70">
              FINAL
            </span>
          ) : (
            <span className="font-display text-2xl sm:text-3xl text-usa-red leading-none">VS</span>
          )}
        </div>
        <TeamName
          align="right"
          code={match.away?.code ?? null}
          name={match.away?.name ?? null}
          isWinner={winner === "away"}
        />
      </div>

      {/* Bottom row: avatars + score-or-date + avatars */}
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <div className="flex -space-x-2 min-h-[1.75rem]">
          {homeOwners.map((p) => (
            <Avatar
              key={p.name}
              src={p.image}
              alt={p.name}
              className="w-7 h-7 sm:w-8 sm:h-8 ring-2 ring-usa-red"
            />
          ))}
        </div>
        <div className="text-center min-w-[5rem] sm:min-w-[7rem]">
          {match.status === "upcoming" ? (
            <div className="font-stencil uppercase leading-tight text-xs sm:text-sm tracking-wider text-usa-navy/80 dark:text-usa-cream/80">
              <div>{formatDay(match.date)}</div>
              <div className="tab-num text-base sm:text-lg text-usa-red">{formatTime(match.date)}</div>
            </div>
          ) : (
            <div className="font-display tab-num text-3xl sm:text-4xl leading-none text-usa-navy dark:text-usa-cream">
              <span className={winner === "home" ? "text-usa-red" : "opacity-60"}>{match.homeScore ?? 0}</span>
              <span className="mx-1.5 opacity-30">–</span>
              <span className={winner === "away" ? "text-usa-red" : "opacity-60"}>{match.awayScore ?? 0}</span>
              {(match.homePens ?? 0) + (match.awayPens ?? 0) > 0 && (
                <div className="font-stencil text-[10px] opacity-70 mt-1 tracking-widest">
                  PENS {match.homePens}–{match.awayPens}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex -space-x-2 justify-end min-h-[1.75rem]">
          {awayOwners.map((p) => (
            <Avatar
              key={p.name}
              src={p.image}
              alt={p.name}
              className="w-7 h-7 sm:w-8 sm:h-8 ring-2 ring-usa-navy dark:ring-usa-gold"
            />
          ))}
        </div>
      </div>
    </article>
  );
}
