import { EventType } from './event';
import { abort } from './utils/abort';
import { deepFreeze } from './utils/deep-freeze';

export class Aggregate {
  private version: number = 0;
  private recordedEvents: EventType<unknown>[] = [];

  public replayEvents<T>(events: EventType<T>[] = []) {
    return events.reduce((self, event) => self.applyAnEvent(event), this);
  }

  private applyAnEvent<T>(event: EventType<T>) {
    if (process.env.NODE_ENV === 'test') deepFreeze(event);

    if ((this as any)[event.eventName] === undefined) {
      if (event.eventName.match(/^[$A-Z_][0-9A-Z_$]*$/i)) {
        abort(
          `Aggregate "${this.constructor.name}" has no method:\n\n${event.eventName}(event) {\n\t// Code goes here...\n}`
        );
      } else {
        abort(
          `Aggregate "${this.constructor.name}" has no method:\n\n['${event.eventName}'](event) {\n\t// Code goes here...\n}`
        );
      }
    }

    try {
      (this as any)[event.eventName](event);
    } catch (err) {
      console.error(
        `An error occurred inside your "%s" function:\n`,
        event.eventName,
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
    let eventToStore = {
      ...event,
      version: this.version,
    };

    this.applyAnEvent(eventToStore);
    this.recordedEvents.push(eventToStore);

    return this;
  }

  public releaseEvents() {
    return this.recordedEvents.splice(0);
  }
}
