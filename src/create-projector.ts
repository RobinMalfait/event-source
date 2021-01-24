import { EventType } from './event';
import { Projector } from './create-event-source';
import { Queue } from './utils/queue';

type EventMapper = Record<string, (event: EventType<unknown>) => void>;

function noop() {}

export function createProjector(
  name: string,
  mapper: EventMapper,
  initializer = noop
): Projector {
  let q = new Queue();

  return {
    name,
    async init(es) {
      // Let's run the initializer
      let initialized = q.push(initializer);

      // Re-build the projection from scratch
      let events = await es.loadEvents<any>();
      await Promise.all(
        events.map(event => q.push(() => mapper[event.eventName]?.(event)))
      );

      await initialized;
    },
    update(event) {
      return q.push(() => mapper[event.eventName]?.(event));
    },
  };
}
