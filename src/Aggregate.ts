import { EventType } from './Event';

export class Aggregate {
  private version: number = 0;
  private recorded_events: EventType<any>[] = [];

  public replayEvents<T>(events: EventType<T>[] = []) {
    return events.reduce((self, event) => self.applyAnEvent(event), this);
  }

  private applyAnEvent<T>(event: EventType<T>) {
    try {
      (this as any)[event.event_name](event);
    } catch (err) {
      console.error(
        `An error occurred inside your "%s" function:\n`,
        event.event_name,
        err.stack
          .split('\n')
          .map((line: string) => `  ${line}`)
          .join('\n')
      );
    } finally {
      this.version++;
    }

    return this;
  }

  protected recordThat<T>(event: EventType<T>) {
    const event_to_store = {
      ...event,
      version: this.version,
    };

    this.applyAnEvent(event_to_store);
    this.recorded_events.push(event_to_store);

    return this;
  }

  public releaseEvents() {
    return this.recorded_events.splice(0);
  }
}
