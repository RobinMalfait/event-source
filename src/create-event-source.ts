import { EventType } from '~/event'
import { CommandType } from '~/command'
import { Aggregate } from '~/aggregate'
import { abort } from '~/utils/abort'

type MaybePromise<T> = T | Promise<T>

export interface EventStore {
  persist<T>(events: EventType<T, unknown>[]): MaybePromise<void>
  load<T>(aggregateId: string): MaybePromise<EventType<T, string>[]>
  loadEvents<T>(): MaybePromise<EventType<T, string>[]>
}

export interface EventSourceConfig<Handlers = any> {
  store: EventStore | Promise<EventStore>
  commandHandlers: Record<string, CommandHandler<Handlers>>
  projectors?: Projector[]
  eventHandlers?: EventHandler[]
}

export interface EventHandler {
  (event: EventType<unknown, string>, es: EventSource): MaybePromise<unknown>
}

export interface Projector<TPayload = any, TEventName = any> {
  name: string
  init: (es: EventSource) => MaybePromise<void>
  update: (event: EventType<TPayload, TEventName>) => MaybePromise<unknown>
}

export interface CommandHandler<T> {
  (command: CommandType<T>, es: EventSource): MaybePromise<void>
}

export type EventSource = ReturnType<typeof createEventSource>
export function createEventSource(config: EventSourceConfig) {
  let {
    commandHandlers,
    eventHandlers = [],
    projectors = [],
    store: storePromise,
  } = config

  let startupPromises: ReturnType<Projector['init']>[] = []

  let api = {
    async resetProjections() {
      await Promise.all(startupPromises)
      await Promise.all(projectors.map((projector) => projector.init(api)))
    },
    async dispatch<T>(command: CommandType<T>) {
      if (commandHandlers[command.type] === undefined) {
        abort(`There is no command handler for the "${command.type}" command`)
      }

      let handle = commandHandlers[command.type]
      await handle(command, api)
      return command
    },

    async loadEvents<T>() {
      let store = await storePromise
      return await store.loadEvents<T>()
    },

    async load<T extends Aggregate>(aggregate: T, aggregateId: string) {
      let store = await storePromise
      let events = await store.load(aggregateId)

      if (events.length <= 0) {
        abort(
          `Aggregate(${aggregate.constructor.name}) with ID(${aggregateId}) does not exist.`,
          { aggregate: aggregate.constructor.name, aggregateId }
        )
      }

      return aggregate.replayEvents(events)
    },

    async persist(aggregate: Aggregate) {
      await Promise.all(startupPromises)
      let store = await storePromise

      // Get all the events that have been produced by the aggregate
      let events = aggregate.releaseEvents()

      // Let's persist all the events
      await store.persist(events)

      for (let event of events) {
        // Run all the projectors
        await Promise.all(
          projectors.map(async (projector) => {
            try {
              await projector.update(event)
            } catch (err) {
              if (err instanceof Error) {
                console.error(
                  `An error occurred in one of your projections: ${projector.name}, given an event`,
                  err.stack
                    ?.split('\n')
                    .map((line: string) => `  ${line}`)
                    .join('\n')
                )
              }
              throw err
            }
          })
        )

        // Run all the event handlers
        await Promise.all(
          eventHandlers.map(async (eventHandler) => {
            try {
              await eventHandler(event, api)
            } catch (err) {
              if (err instanceof Error) {
                console.error(
                  `An error occurred in one of your event handlers: ${eventHandler.name}, given an event`,
                  err.stack
                    ?.split('\n')
                    .map((line: string) => `  ${line}`)
                    .join('\n')
                )
              }
              throw err
            }
          })
        )
      }
    },

    async loadPersist<T extends Aggregate>(
      aggregate: T,
      aggregateId: string,
      handle: (aggregate: T) => Promise<void> | void
    ) {
      await this.load(aggregate, aggregateId)
      await handle(aggregate)
      return this.persist(aggregate)
    },
  }

  // Run all projection initializers
  for (let projector of projectors) startupPromises.push(projector.init(api))

  return api
}
