import { EventType } from './event';
import { abort } from './utils/abort';
import { deepFreeze } from './utils/deep-freeze';

export class Aggregate {
  private version: number = 0;
  private recorded_events: EventType<unknown>[] = [];

  public replayEvents<T>(events: EventType<T>[] = []) {
    return events.reduce((self, event) => self.applyAnEvent(event), this);
  }

  private applyAnEvent<T>(event: EventType<T>) {
    if (process.env.NODE_ENV === 'test') {
      deepFreeze(event);
    }

    if ((this as any)[event.event_name] === undefined) {
      if (event.event_name.match(/^[$A-Z_][0-9A-Z_$]*$/i)) {
        abort(
          `Aggregate "${this.constructor.name}" has no method:\n\n${event.event_name}(event) {\n\t// Code goes here...\n}`
        );
      } else {
        abort(
          `Aggregate "${this.constructor.name}" has no method:\n\n['${event.event_name}'](event) {\n\t// Code goes here...\n}`
        );
      }
    }

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
    let event_to_store = {
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
