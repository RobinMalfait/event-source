import {
  CommandHandler,
  createEventSource,
  Projector,
} from './create-event-source';
import { EventType } from './event';
import { CommandType } from './command';
import { objectToYaml } from './utils/object-to-yaml';
import { abort } from './utils/abort';

let PLACEHOLDER = Symbol('__placeholder__');

let info = {
  used_test_event_store_in_test: false,
  called_then_handler: false,
};

if (process.env.NODE_ENV === 'test') {
  beforeEach(() => {
    info.used_test_event_store_in_test = false;
    info.called_then_handler = false;
  });

  afterEach(() => {
    if (info.used_test_event_store_in_test && !info.called_then_handler) {
      abort(
        'It seems like you used `createTestEventStore()`\nwithout using the `await then([expected, events, go, here, ...])`'
      );
    }
  });
}

function cleanThrow(cb: () => unknown, fn: Function) {
  try {
    return cb();
  } catch (e) {
    if (Error.captureStackTrace) Error.captureStackTrace(e, fn);
    throw e;
  }
}

export function createTestEventStore(
  command_handlers: Record<string, CommandHandler<any>>,
  projectors: Projector[] = []
) {
  let db: EventType<any>[] = [];
  let produced_events: EventType<any>[] = [];

  info.used_test_event_store_in_test = true;

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

  let es = createEventSource({
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

  let returnValue = {
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
      info.called_then_handler = true;

      // We expect errors, so let's verify the error
      if (events instanceof Error) {
        cleanThrow(
          () => expect(caught_error).toEqual(events),
          returnValue.then
        );
        return;
      }

      // At this point, we expected some events, but we caught an error instead.
      // Therefore, we have to re-throw the error
      if (caught_error) {
        if (Object.keys(caught_error).length > 0) {
          caught_error.message = [
            'With properties:',
            `\n${objectToYaml(caught_error)}\n\n---\n\n`,
          ].join('\n');
        }

        throw caught_error;
      }

      cleanThrow(() => {
        // Verify that the actual events and expected events have the same length
        expect(events).toHaveLength(produced_events.length);

        // Verify each individual event
        events.forEach((event, index) => {
          let { aggregate_id, event_name, payload } = produced_events[index];

          expect(event.aggregate_id).toEqual(aggregate_id);
          expect(event.event_name).toEqual(event_name);

          if (event.payload === null || event.payload === undefined) {
            expect(event.payload).toEqual(payload);
          }

          for (let key in event.payload) {
            let value = event.payload[key] as any;

            if (value === PLACEHOLDER) {
              expect(payload).toHaveProperty(key);
              expect(payload[key]).toBeDefined();
            } else {
              expect(payload[key]).toEqual(value);
            }
          }
        });
      }, returnValue.then);
    },
  };

  return returnValue;
}
