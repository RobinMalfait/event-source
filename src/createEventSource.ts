import { EventType } from './Event';
import { CommandType } from './Command';
import { Aggregate } from './Aggregate';
import { createError } from './utils/createError';
import { abort } from './utils/abort';

export type EventStore = {
  persist<T>(events: EventType<T>[]): void | Promise<void>;
  load<T>(aggregate_id: string): EventType<T>[] | Promise<EventType<T>[]>;
  loadEvents<T>(): EventType<T>[] | Promise<EventType<T>[]>;
};

export type EventSourceConfig = {
  store: EventStore | Promise<EventStore>;
  command_handlers: Record<string, CommandHandler<any>>;
  projectors?: Projector[];
  event_handlers?: EventHandler[];
};

export type EventHandler = (event: EventType<any>, es: EventSource) => void;

export type Projector = {
  name: string;
  init: (es: EventSource) => Promise<any> | void;
  update: (event: EventType<any>) => Promise<any> | void;
};

export type CommandHandler<T> = (
  command: CommandType<T>,
  es: EventSource
) => void | Promise<void>;

export type EventSource = ReturnType<typeof createEventSource>;
export function createEventSource(config: EventSourceConfig) {
  const {
    command_handlers,
    event_handlers = [],
    projectors = [],
    store: store_promise,
  } = config;

  const api = {
    async dispatch<T>(command: CommandType<T>) {
      if (command_handlers[command.type] === undefined) {
        abort(`There is no command handler for the "${command.type}" command`);
      }

      const handle = command_handlers[command.type];
      await handle(command, api);
      return command;
    },

    async loadEvents<T>() {
      const store = await store_promise;
      return await store.loadEvents<T>();
    },

    async load<T extends Aggregate>(aggregate: T, aggregate_id: string) {
      const store = await store_promise;
      const events = await store.load(aggregate_id);

      if (events.length <= 0) {
        throw createError(
          `Aggregate(${aggregate.constructor.name}) with ID(${aggregate_id}) does not exist.`,
          { aggregate: aggregate.constructor.name, aggregate_id }
        );
      }

      return aggregate.replayEvents(events);
    },

    async persist(aggregate: Aggregate) {
      const store = await store_promise;

      const events = aggregate.releaseEvents();

      await store.persist(events);

      await Promise.all(
        events.map(async event => {
          await Promise.all(
            projectors.map(async projector => {
              try {
                await projector.update(event);
              } catch (err) {
                throw createError(
                  `An error occurred in one of your projections: ${projector.name}, given an event`,
                  {
                    projector: projector.name,
                    event_id: event.event_id,
                    event_name: event.event_name,
                    aggregate_id: event.aggregate_id,
                    recorded_at: event.recorded_at,
                  }
                );
              }
            })
          );

          await Promise.all(
            event_handlers.map(async eventHandler => {
              try {
                await eventHandler(event, api);
              } catch (err) {
                throw createError(
                  `An error occurred in one of your event handlers: ${eventHandler.name}, given an event`,
                  {
                    eventHandler: eventHandler.name,
                    event_id: event.event_id,
                    event_name: event.event_name,
                    aggregate_id: event.aggregate_id,
                    recorded_at: event.recorded_at,
                  }
                );
              }
            })
          );
        })
      );
    },
  };

  // Run all projection initializers
  projectors.forEach(projector => {
    projector.init(api);
  });

  return api;
}
