import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TaskGenerator, dropTask, task, timeout } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';

const standingsEndpoint = `https://standings.uefa.com/v1/standings?competitionId=3&phase=TOURNAMENT&seasonYear=2024`;
const apiKey = `ceeee1a5bb209502c6c438abd8f30aef179ce669bb9288f2d1cf2fa276de03f4`;
const liveScoreEndpoint = `https://api.fifa.com/api/v3/live/football/range?from=2022-12-01T00:00:00Z&to=2022-12-20T00:00:00Z&IdSeason=255711&IdCompetition=17`;
const fifaStandingsEndpoint = `https://api.fifa.com/api/v3/calendar/17/255711/285063/standing?language=en`;

enum competitionType {
  Fifa,
  Uefa,
}
export type CountryCode =
  | 'ALB'
  | 'SVN'
  | 'ROU'
  | 'GEO'
  | 'ENG'
  | 'DEN'
  | 'MKD'
  | 'ITA'
  | 'RUS'
  | 'UKR'
  | 'NED'
  | 'POL'
  | 'WAL'
  | 'GER'
  | 'CRO'
  | 'FIN'
  | 'BEL'
  | 'SWE'
  | 'HUN'
  | 'POR'
  | 'TUR'
  | 'SVK'
  | 'FRA'
  | 'SUI'
  | 'SCO'
  | 'ESP'
  | 'AUT'
  | 'CZE'
  | 'ARG'
  | 'BRA'
  | 'MAR'
  | 'AUS'
  | 'CAN'
  | 'GHA'
  | 'JPN'
  | 'MEX'
  | 'SEN'
  | 'URU'
  | 'CMR'
  | 'KOR'
  | 'QAT'
  | 'SRB'
  | 'TUN'
  | 'USA'
  | 'CRC'
  | 'ECU'
  | 'IRN'
  | 'KSA'
  | 'NOR'
  | 'CHE'
  | 'NZL'
  | 'PHI'
  | 'IRL'
  | 'NGA'
  | 'ZAM'
  | 'CRI'
  | 'DNK'
  | 'CHN'
  | 'HAI'
  | 'VIE'
  | 'JAM'
  | 'PAN'
  | 'RSA'
  | 'COL';

export interface TeamWireFormat {
  countryCode: CountryCode;
}

export interface FixtureWireFormat {
  homeTeam: TeamWireFormat;
  awayTeam: TeamWireFormat;
  kickOffTime: { dateTime: string };
  group: { metaData: { groupName: string } };
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  minute?: { normal: number; injury?: number };
  translations?: { phaseName: { EN: string } };
  score?: { total: { away: number; home: number } };
  round?: { metaData: { name: string } };
}

export interface TeamStanding {
  drawn: number;
  goalDifference: number;
  goalsAgainst: number;
  goalsFor: number;
  isLive: boolean;
  lost: number;
  played: number;
  points: number;
  won: number;
  team: TeamWireFormat;
}

export interface GroupStandingWireFormat {
  items: Array<TeamStanding>;
}

export interface MatchResult {
  MatchTime?: any;
  GroupName?: [{ Description: string }];
  StageName?: [{ Description: string }];
  Date?: string;
  HomeTeam?: {
    IdCountry: string;
    Score: number;
    ShortClubName: string;
  };
  AwayTeam?: {
    IdCountry: string;
    Score: number;
    ShortClubName: string;
  };
  MatchStatus?: number; // 1 == Not started? 3 == live,
  Period?: number; // 0 == not started? 3 == first half? 4 == half time, 5 == second half,
  Winner?: string;
  status?: string;
  awayTeam?: { countryCode: string };
  homeTeam?: { countryCode: string };
}
export interface LiveScoreWireFormat {
  Results: Array<MatchResult>;
}

export interface FifaStandingWireFormat {
  Team: {
    IdCountry: string;
    ShortClubName: string;
    IdAssociation: string;
  };
  Won: number;
  Played: number;
  Points: number;
  Lost: number;
  Drawn: number;
  For: number;
  Against: number;
  GoalsDiference: number;
  IdGroup: string;
}

export interface UefaStandingWireFormat {
  team: {
    associationId: string;
    countryCode: string;
    internationalName: string;
  };
  drawn: number;
  goalDifference: number;
  goalsAgainst: number;
  goalsFor: number;
  isLive: boolean;
  lost: number;
  played: number;
  points: number;
  won: number;
}

const comp: competitionType = competitionType.Uefa;

function fifaFixtureToStatus(fifaFixture: MatchResult) {
  if (fifaFixture.Winner || fifaFixture.Period === 10) {
    return 'FINISHED';
  } else if (fifaFixture.MatchStatus === 3) {
    return 'LIVE';
  } else {
    return 'UPCOMING';
  }
}

function fifaToUefaPhaseName(phaseNumber: number) {
  switch (phaseNumber) {
    case 3:
      return 'First half';
    case 4:
      return 'Half time';
    case 5:
      return 'Second half';
    default:
      return 'In progress';
  }
}
function parseUefaFixture(fixture: any): FixtureWireFormat {
  return fixture as FixtureWireFormat;
}

function parseFifaFixture(fifaFixture: any): FixtureWireFormat {
  let fixture: FixtureWireFormat = {
    homeTeam: {
      countryCode: fifaFixture.HomeTeam.IdCountry as CountryCode,
    },
    awayTeam: {
      countryCode: fifaFixture.AwayTeam.IdCountry as CountryCode,
    },
    kickOffTime: { dateTime: fifaFixture.Date },
    group: {
      metaData: {
        groupName:
          fifaFixture.GroupName[0]?.Description ||
          fifaFixture.StageName[0]?.Description,
      },
    },
    status: fifaFixtureToStatus(fifaFixture),
  };

  if (fixture.status === 'LIVE') {
    fixture.minute = { normal: fifaFixture.MatchTime };
    fixture.translations = {
      phaseName: { EN: fifaToUefaPhaseName(fifaFixture.Period) },
    };
    fixture.score = {
      total: {
        away: fifaFixture.AwayTeam.Score,
        home: fifaFixture.HomeTeam.Score,
      },
    };
  }

  if (fixture.status === 'FINISHED') {
    fixture.score = {
      total: {
        away: fifaFixture.AwayTeam.Score,
        home: fifaFixture.HomeTeam.Score,
      },
    };
  }

  return fixture;
}

function parseFifaStandings(
  standings: Array<FifaStandingWireFormat>,
  liveFixtures: Array<MatchResult>
): Array<TeamStanding> {
  return standings.map((standing) => {
    return {
      drawn: standing?.Drawn,
      goalDifference: standing?.GoalsDiference,
      goalsAgainst: standing?.Against,
      goalsFor: standing?.For,
      isLive: liveFixtures.any(
        (fixture) =>
          fixture.AwayTeam?.IdCountry === standing.Team.IdCountry ||
          fixture.HomeTeam?.IdCountry === standing.Team.IdCountry ||
          fixture.HomeTeam?.IdCountry === standing.Team.IdAssociation ||
          fixture.AwayTeam?.IdCountry === standing.Team.IdAssociation
      ),
      lost: standing?.Lost,
      played: standing?.Played,
      points: standing?.Points,
      won: standing?.Won,
      team: {
        countryCode:
          standing?.Team?.IdCountry ??
          (standing?.Team?.IdAssociation as CountryCode),
      },
    };
  });
}

function parseUefaStandings(liveFixtures: Array<any>): Array<TeamStanding> {
  let viaFixtures = liveFixtures.reduce((acc, fixture) => {
    if (fixture.status !== 'FINISHED') {
      return acc;
    }
    let nullTeamStanding: TeamStanding = {
      drawn: 0,
      goalDifference: 0,
      goalsAgainst: 0,
      goalsFor: 0,
      isLive: false,
      lost: 0,
      played: 0,
      points: 0,
      won: 0,
      fixtures: [],
      team: { countryCode: 'ENG' as CountryCode },
    };
    let homeCode = fixture.homeTeam?.countryCode as CountryCode;
    let awayCode = fixture.awayTeam?.countryCode as CountryCode;
    if (!acc.has(homeCode)) {
      acc.set(homeCode, {
        ...nullTeamStanding,
        team: { countryCode: homeCode },
      });
    }
    if (!acc.has(awayCode)) {
      acc.set(awayCode, {
        ...nullTeamStanding,
        team: { countryCode: awayCode },
      });
    }
    let homeStanding = acc.get(homeCode)!;
    let awayStanding = acc.get(awayCode)!;

    if (fixture.MatchStatus === 3) {
      homeStanding.isLive = true;
      awayStanding.isLive = true;
    }

    homeStanding.played++;
    awayStanding.played++;
    homeStanding.fixtures.push(fixture);
    awayStanding.fixtures.push(fixture);

    if (fixture.status === 'FINISHED' && fixture.score && fixture.score) {
      homeStanding.goalsFor += fixture.score.total.home;
      homeStanding.goalsAgainst += fixture.score.total.away;
      awayStanding.goalsFor += fixture.score.total.away;
      awayStanding.goalsAgainst += fixture.score.total.home;
      if (fixture.score.total.home > fixture.score.total.away) {
        homeStanding.won++;
        awayStanding.lost++;
        homeStanding.points += 3;
      } else if (fixture.homeTeam.score < fixture.awayTeam.score) {
        awayStanding.won++;
        homeStanding.lost++;
        awayStanding.points += 3;
      } else {
        homeStanding.drawn++;
        awayStanding.drawn++;
        homeStanding.points++;
        awayStanding.points++;
      }
      homeStanding.goalDifference =
        fixture.score.total.home - fixture.score.total.away;
      awayStanding.goalDifference =
        fixture.score.total.away - fixture.score.total.home;
    }

    acc.set(homeCode, homeStanding);
    acc.set(awayCode, awayStanding);
    return acc;
  }, new Map<CountryCode, TeamStanding>());

  return Array.from(viaFixtures.values());
}
export default class Api extends Service {
  @tracked model!: {
    standings: Array<GroupStandingWireFormat>;
    fixtures: Array<FixtureWireFormat>;
    liveScores: Array<MatchResult>;
  };

  @dropTask
  *loadModel(): TaskGenerator<void> {
    let standingsFn =
      comp === competitionType.Uefa
        ? this.loadStandings
        : this.loadFifaStandings;
    let liveScoresFn =
      comp === competitionType.Uefa ? this.uefaLiveScores : this.liveScores;

    let result = yield Promise.all([
      taskFor(standingsFn).perform(),
      taskFor(liveScoresFn).perform(),
    ]);
    this.model = {
      standings: [],
      fixtures: [],
      liveScores: [],
    };
    let liveScores: Array<MatchResult>;

    switch (comp) {
      case competitionType.Uefa:
        liveScores = result[1];
        break;
      case competitionType.Fifa:
        liveScores = result[1].Results as Array<MatchResult>;
        break;
    }
    console.log({ foo: liveScores });
    this.model = {
      standings: [],
      fixtures: result[0] as Array<FixtureWireFormat>,
      liveScores: liveScores,
    };

    let mappedStandings: Array<TeamStanding> = [];

    let fixtures: FixtureWireFormat[] = this.model.liveScores.map((fixture) => {
      switch (comp) {
        case competitionType.Uefa:
          return parseUefaFixture(fixture);
        case competitionType.Fifa:
          return parseFifaFixture(fixture);
      }
    });

    let standings;
    switch (comp) {
      case competitionType.Uefa:
        break;
      case competitionType.Fifa:
        let fifaStandings = result[1].Results as Array<FifaStandingWireFormat>;
        standings = fifaStandings;
        break;
    }

    let liveFixtures = this.model.liveScores.filter(
      (fixture) => fixture.MatchStatus === 3 || fixture.status === 'LIVE'
    );

    switch (comp) {
      case competitionType.Fifa:
        mappedStandings = parseFifaStandings(
          standings as Array<FifaStandingWireFormat>,
          liveFixtures
        );
        break;

      case competitionType.Uefa:
        mappedStandings = parseUefaStandings(this.model.liveScores);
        break;
    }

    this.model.standings = [
      { items: mappedStandings },
    ] as GroupStandingWireFormat[];

    this.model.fixtures = fixtures;
  }

  @task
  *enqueueRefresh(): TaskGenerator<void> {
    yield timeout(10_000); //10 seconds
    yield taskFor(this.loadModel).perform();
    taskFor(this.enqueueRefresh).perform();
  }

  @task
  *loadStandings(): TaskGenerator<Array<GroupStandingWireFormat>> {
    return yield this.fetch(standingsEndpoint);
  }

  @task
  *loadFifaStandings(): TaskGenerator<Array<FifaStandingWireFormat>> {
    return yield this.fetch(fifaStandingsEndpoint);
  }

  @task
  *uefaLiveScores(): TaskGenerator<Array<UefaStandingWireFormat>> {
    let pageSize = 50;
    let fixtures = new Map<string, UefaStandingWireFormat>();
    let newFixturesToFecth = true;
    let i = 0;
    let previousFixtureCount = 0;
    while (newFixturesToFecth) {
      let offset = i * pageSize;
      let url = `https://match.uefa.com/v5/matches?competitionId=3&limit=${pageSize}&offset=${offset}&order=ASC&phase=TOURNAMENT&seasonYear=2024`;
      console.log({ url });
      let result = yield this.fetch(url);

      result.forEach((fixture) => {
        fixtures.set(fixture.id, fixture);
      });

      if (fixtures.size === previousFixtureCount) {
        newFixturesToFecth = false;
      }
      previousFixtureCount = fixtures.size;
      i++;
    }

    return Array.from(fixtures.values());
  }

  @task
  *liveScores(): TaskGenerator<any> {
    let res = yield Promise.all([this.fetch(liveScoreEndpoint)]);

    return res[0];
  }

  async fetch(endpoint: string) {
    let result = await fetch(endpoint, {
      headers: {
        'x-api-key': apiKey,
      },
    });
    return await result.json();
  }
}
