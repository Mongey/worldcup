import Component from '@glimmer/component';
import { FixtureWireformat } from 'worldcup/services/api';

interface Args {
  fixture: FixtureWireformat;
}

export default class WorldCupFixtureListFixtureComponent extends Component<Args> {
  get isLive(): boolean {
    return this.args.fixture.status === 'LIVE';
  }

  get isUpcoming(): boolean {
    return this.kickOffTime > new Date();
  }

  get kickOffTime(): Date {
    return new Date(this.args.fixture.kickOffTime.dateTime);
  }

  get matchShouldBeFinishedByTime(): Date {
    let expectedDurationMinutes = 90 + 15 + 10;
    return new Date(
      this.kickOffTime.getTime() + expectedDurationMinutes * 60 * 1000
    );
  }

  get isFinished(): boolean {
    return (
      this.args.fixture.status === 'FINISHED' ||
      new Date() > this.matchShouldBeFinishedByTime
    );
  }
}
