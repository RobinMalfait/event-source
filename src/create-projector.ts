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
  const q = new Queue();

  return {
    name,
    async init(es: EventSource) {
      // Let's run the initializer
      const initialized = q.push(() => initializer());

      // Re-build the projection from scratch
      const events = await es.loadEvents<any>();
      await Promise.all(
        events.map(event => {
          if (mapper[event.event_name] === undefined) {
            return undefined;
          }

          return q.push(() => mapper[event.event_name](event));
        })
      );

      await initialized;
    },
    update(event: EventType<any>) {
      if (mapper[event.event_name] === undefined) {
        return;
      }

      return q.push(() => mapper[event.event_name](event));
    },
  };
}
