import type { Match, TeamStanding } from "../api/types";
import { flagFor, nameFor } from "../data/teams";

export interface Player {
  name: string;
  teams: string[]; // FIFA 3-letter codes
  image: string;
}

export interface PlayerTeamRow {
  code: string;
  name: string;
  flag: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  isLive: boolean;
}

export interface PlayerStanding {
  player: Player;
  teams: PlayerTeamRow[];
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  hasLiveMatch: boolean;
}

export type ScoringMode = "group" | "all";

interface TeamStats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  isLive: boolean;
}

function emptyStats(): TeamStats {
  return {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    isLive: false,
  };
}

function emptyStandingFrom(s: TeamStanding): TeamStanding {
  return {
    ...s,
    ...emptyStats(),
  };
}

function ensureStanding(
  standingsByCode: Map<string, TeamStanding>,
  code: string,
  name: string,
): TeamStanding {
  const existing = standingsByCode.get(code);
  if (existing) return existing;

  const created: TeamStanding = {
    code,
    name,
    group: "",
    ...emptyStats(),
    position: 0,
  };
  standingsByCode.set(code, created);
  return created;
}

function addResult(
  team: TeamStanding,
  goalsFor: number,
  goalsAgainst: number,
  outcome: "win" | "draw" | "loss",
  isLive: boolean,
) {
  team.played += 1;
  team.goalsFor += goalsFor;
  team.goalsAgainst += goalsAgainst;
  team.goalDifference = team.goalsFor - team.goalsAgainst;
  team.isLive ||= isLive;

  if (outcome === "win") {
    team.won += 1;
    team.points += 3;
  } else if (outcome === "draw") {
    team.drawn += 1;
    team.points += 1;
  } else {
    team.lost += 1;
  }
}

function matchOutcomes(m: Match): ["win" | "draw" | "loss", "win" | "draw" | "loss"] | null {
  if (m.status === "upcoming" || !m.home || !m.away) return null;
  if (m.homeScore == null || m.awayScore == null) return null;

  if (m.winnerIdTeam) {
    if (m.winnerIdTeam === m.home.id) return ["win", "loss"];
    if (m.winnerIdTeam === m.away.id) return ["loss", "win"];
  }

  if (m.homeScore > m.awayScore) return ["win", "loss"];
  if (m.awayScore > m.homeScore) return ["loss", "win"];

  if (m.homePens != null && m.awayPens != null) {
    if (m.homePens > m.awayPens) return ["win", "loss"];
    if (m.awayPens > m.homePens) return ["loss", "win"];
  }

  return ["draw", "draw"];
}

function buildGroupStageStandings(standings: TeamStanding[]): Map<string, TeamStanding> {
  const standingsByCode = new Map<string, TeamStanding>();
  for (const s of standings) standingsByCode.set(s.code, s);
  return standingsByCode;
}

function buildAllMatchStandings(standings: TeamStanding[], matches: Match[]): Map<string, TeamStanding> {
  const standingsByCode = new Map<string, TeamStanding>();
  for (const s of standings) standingsByCode.set(s.code, emptyStandingFrom(s));

  for (const m of matches) {
    const outcomes = matchOutcomes(m);
    if (!outcomes || !m.home || !m.away || m.homeScore == null || m.awayScore == null) continue;

    const home = ensureStanding(standingsByCode, m.home.code, m.home.name);
    const away = ensureStanding(standingsByCode, m.away.code, m.away.name);
    const isLive = m.status === "live";

    addResult(home, m.homeScore, m.awayScore, outcomes[0], isLive);
    addResult(away, m.awayScore, m.homeScore, outcomes[1], isLive);
  }

  return standingsByCode;
}

// Build per-team rows for a player by combining the player's assigned team
// codes with the selected standings source. Teams not yet found in that source
// get zeros.
function teamRowsFor(player: Player, standingsByCode: Map<string, TeamStanding>, liveCodes: Set<string>): PlayerTeamRow[] {
  return player.teams.map((code): PlayerTeamRow => {
    const s = standingsByCode.get(code);
    return {
      code,
      name: s?.name ?? nameFor(code),
      flag: flagFor(code),
      group: s?.group ?? "",
      played: s?.played ?? 0,
      won: s?.won ?? 0,
      drawn: s?.drawn ?? 0,
      lost: s?.lost ?? 0,
      goalsFor: s?.goalsFor ?? 0,
      goalsAgainst: s?.goalsAgainst ?? 0,
      goalDifference: s?.goalDifference ?? 0,
      points: s?.points ?? 0,
      isLive: liveCodes.has(code),
    };
  });
}

export function computePlayerStandings(
  players: Player[],
  standings: TeamStanding[],
  matches: Match[],
  scoringMode: ScoringMode = "all",
): PlayerStanding[] {
  const standingsByCode = scoringMode === "all"
    ? buildAllMatchStandings(standings, matches)
    : buildGroupStageStandings(standings);

  // Codes currently playing (status === "live").
  const liveCodes = new Set<string>();
  for (const m of matches) {
    if (m.status !== "live") continue;
    if (m.home?.code) liveCodes.add(m.home.code);
    if (m.away?.code) liveCodes.add(m.away.code);
  }

  const rows = players.map((player): PlayerStanding => {
    const teamRows = teamRowsFor(player, standingsByCode, liveCodes);
    const totals = teamRows.reduce(
      (acc, t) => ({
        played: acc.played + t.played,
        won: acc.won + t.won,
        drawn: acc.drawn + t.drawn,
        lost: acc.lost + t.lost,
        goalsFor: acc.goalsFor + t.goalsFor,
        goalsAgainst: acc.goalsAgainst + t.goalsAgainst,
        goalDifference: acc.goalDifference + t.goalDifference,
        points: acc.points + t.points,
      }),
      { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
    );
    return {
      player,
      teams: teamRows,
      ...totals,
      hasLiveMatch: teamRows.some((t) => t.isLive),
    };
  });

  // Sort by points desc, then GD, then GF, then wins (matches old behaviour).
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return b.won - a.won;
  });

  return rows;
}
