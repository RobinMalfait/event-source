import { EventType } from './event';
import { EventSource, Projector } from './create-event-source';
import { Queue } from './utils/queue';

type EventMapper = Record<string, (event: EventType<any>) => void>;

function noop() {}

export function createProjector(
  name: string,
  mapper: EventMapper,
  initializer = noop
): Projector {
  let q = new Queue();

  return {
    name,
    async init(es: EventSource) {
      // Let's run the initializer
      let initialized = q.push(() => initializer());

      // Re-build the projection from scratch
      let events = await es.loadEvents<any>();
      await Promise.all(
        events.map(event => {
          return q.push(() => mapper[event.event_name]?.(event));
        })
      );

      await initialized;
    },
    update(event: EventType<any>) {
      return q.push(() => mapper[event.event_name]?.(event));
    },
  };
}
