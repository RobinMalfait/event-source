import {
  CommandHandler,
  createEventSource,
  Projector,
} from './create-event-source';
import { EventType } from './event';
import { CommandType } from './command';
import { objectToYaml } from './utils/object-to-yaml';
import { abort } from './utils/abort';

const PLACEHOLDER = Symbol('__placeholder__');

let used_test_event_store_in_test = false;
let called_then_handler = false;
beforeEach(() => {
  used_test_event_store_in_test = false;
  called_then_handler = false;
});
afterEach(() => {
  if (used_test_event_store_in_test && !called_then_handler) {
    abort(
      'It seems like you used `createTestEventStore()`\nwithout using the `await then([expected, events, go, here, ...])`'
    );
  }
});

export function createTestEventStore(
  command_handlers: Record<string, CommandHandler<any>>,
  projectors: Projector[] = []
) {
  const db: EventType<any>[] = [];
  const produced_events: EventType<any>[] = [];

  used_test_event_store_in_test = true;

  function createTestRecordingProjector() {
    return {
      name: 'test-recording-projector',
      init() {
        db.splice(0);
      },
      update<T>(event: EventType<T>) {
        produced_events.push(event);
      },
    };
  }

  const es = createEventSource({
    store: {
      async load(aggregate_id) {
        return db.filter(event => event.aggregate_id === aggregate_id);
      },
      loadEvents() {
        return db;
      },
      persist(events) {
        db.push(...events);
      },
    },
    command_handlers,
    projectors: [...projectors, createTestRecordingProjector()],
  });

  let caught_error: Error;

  return {
    ___: PLACEHOLDER as any, // Expose as type `any` so that it is assignable to values
    given(events: EventType<any>[] = []) {
      db.push(...events);
    },
    async when<T>(command: CommandType<T>) {
      try {
        return await es.dispatch(command);
      } catch (err) {
        caught_error = err;
        return command;
      }
    },
    then<T>(events: EventType<T>[] | Error) {
      // Mark that we called the then function. If not we probably had a
      // successful test that actually didn't test anything!
      called_then_handler = true;

      // We expect errors, so let's verify the error
      if (events instanceof Error) {
        const error = events;
        expect(caught_error).toEqual(error);
        return;
      }

      // At this point, we expected some events, but we caught an error instead.
      // Therefore, we have to re-throw the error
      if (caught_error) {
        if (Object.keys(caught_error).length > 0) {
          const [, ...lines] = caught_error.stack!.split('\n');
          abort('With properties:', {
            stack: [
              `\n\n${objectToYaml(caught_error)}\n\n${caught_error.name}: ${
                caught_error.message
              }`,
              ...lines,
            ].join('\n'),
          });
        } else {
          throw caught_error;
        }
      }

      // Verify that the actual events and expected events have the same length
      expect(events).toHaveLength(produced_events.length);

      // Verify each individual event
      events.forEach((event, index) => {
        const { aggregate_id, event_name, payload } = produced_events[index];

        expect(event.aggregate_id).toEqual(aggregate_id);
        expect(event.event_name).toEqual(event_name);

        if (event.payload === null || event.payload === undefined) {
          expect(event.payload).toEqual(payload);
        }

        for (const key in event.payload) {
          const value = event.payload[key] as any;

          if (value === PLACEHOLDER) {
            expect(payload).toHaveProperty(key);
            expect(payload[key]).toBeDefined();
          } else {
            expect(payload[key]).toEqual(value);
          }
        }
      });
    },
  };
}
