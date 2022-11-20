import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TaskGenerator, task, dropTask, timeout } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';

const standingsEndpoint = `https://standings.uefa.com/v1/standings?groupIds=2007941,2007942,2007943,2007944,2007946,2007945,2007947,2007948`;
const fixturesEnpoint = `https://match.uefa.com/v5/matches?competitionId=17&utcOffset=1&order=ASC&offset=0&fromDate=2022-11-20&toDate=2022-12-18&limit=100`;
const apiKey = `ceeee1a5bb209502c6c438abd8f30aef179ce669bb9288f2d1cf2fa276de03f4`;
const liveScoreEndpoint = `https://api.fifa.com/api/v3/live/football/range?from=2022-11-20T00:00:00Z&to=2023-07-20T00:00:00Z&IdSeason=255711&language=en`;

export type CountryCode =
  | 'ARG'
  | 'BRA'
  | 'CRO'
  | 'ENG'
  | 'GER'
  | 'ITA'
  | 'MAR'
  | 'POL'
  | 'SCO'
  | 'SVK'
  | 'UKR'
  | 'AUS'
  | 'CAN'
  | 'CZE'
  | 'ESP'
  | 'GHA'
  | 'JPN'
  | 'MEX'
  | 'POR'
  | 'SEN'
  | 'SWE'
  | 'URU'
  | 'AUT'
  | 'CMR'
  | 'DEN'
  | 'FIN'
  | 'HUN'
  | 'KOR'
  | 'MKD'
  | 'QAT'
  | 'SRB'
  | 'TUN'
  | 'USA'
  | 'BEL'
  | 'CRC'
  | 'ECU'
  | 'FRA'
  | 'IRN'
  | 'KSA'
  | 'NED'
  | 'RUS'
  | 'SUI'
  | 'TUR'
  | 'WAL';

export interface TeamWireFormat {
  internationalName: string;
  associationLogoUrl: string;
  countryCode: CountryCode;
  isPlaceholder: boolean;
}
export interface FixtureWireformat {
  homeTeam: TeamWireFormat;
  awayTeam: TeamWireFormat;
  kickOffTime: { dateTime: string };
  group: { metadata: { groupName: string } };
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  minute?: { normal: number; injury?: number };
  translations?: { phaseName: { EN: string } };
  score?: { total: { away: number; home: number } };
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
  MatchTime: string;
  GroupName: string;
  Date: string;
  HomeTeam: {
    IdCountry: string;
    Score: number;
  };
  AwayTeam: {
    IdCountry: string;
    Score: number;
  };
  MatchStatus: number; // 3 == live
}
export interface LiveScoreWireFormat {
  Results: Array<MatchResult>;
}

export default class Api extends Service {
  @tracked model!: {
    standings: Array<GroupStandingWireFormat>;
    fixtures: Array<FixtureWireformat>;
    liveScores: Array<MatchResult>;
  };

  @dropTask
  *loadModel(): TaskGenerator<void> {
    let result = yield Promise.all([
      taskFor(this.loadStandings).perform(),
      taskFor(this.loadFixtures).perform(),
      taskFor(this.liveScores).perform(),
    ]);
    this.model = {
      standings: [],
      fixtures: [],
      liveScores: [],
    };
    this.model = {
      standings: result[0] as Array<GroupStandingWireFormat>,
      fixtures: result[1] as Array<FixtureWireformat>,
      liveScores: result[2].Results as Array<MatchResult>,
    };

    let liveFixtures = this.model.liveScores.filter(
      (fixture) => fixture.MatchStatus === 3
    );

    // The UEFA API does not seem to be returning live scores for FIFA competitions,
    // so just inject the scores from the FIFA API here to avoid having to rewrite the app.
    liveFixtures.forEach((liveFixture) => {
      let matchingFixture = this.model.fixtures.find(
        (fixture) =>
          fixture.kickOffTime.dateTime === liveFixture.Date &&
          fixture.homeTeam.countryCode === liveFixture.HomeTeam.IdCountry &&
          fixture.awayTeam.countryCode === liveFixture.AwayTeam.IdCountry
      );

      if (matchingFixture) {
        matchingFixture.status = 'LIVE';
        matchingFixture.score = {
          total: {
            away: liveFixture.AwayTeam.Score,
            home: liveFixture.HomeTeam.Score,
          },
        };
      }
    });
  }

  @task
  *enqueueRefresh(): TaskGenerator<void> {
    yield timeout(10_000); //10 seconds
    yield taskFor(this.loadModel).perform();
    taskFor(this.enqueueRefresh).perform();
  }

  @task
  *loadFixtures(): TaskGenerator<Array<FixtureWireformat>> {
    return yield this.fetch(fixturesEnpoint);
  }

  @task
  *loadStandings(): TaskGenerator<Array<GroupStandingWireFormat>> {
    return yield this.fetch(standingsEndpoint);
  }

  @task
  *liveScores(): TaskGenerator<any> {
    return yield this.fetch(liveScoreEndpoint);
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
