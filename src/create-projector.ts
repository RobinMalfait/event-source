import { EventType } from './event'
import { Projector } from './create-event-source'
import { Queue } from './utils/queue'

type EventMapper<Ctx, TPayload, TEventName> = Record<
  string,
  (event: EventType<TPayload, TEventName>, ctx?: Ctx) => void
>

function noop() {}

export function createProjector<Ctx, TPayload, TEventName>(
  name: string,
  mapper: EventMapper<Ctx, TPayload, TEventName>,
  initializer: (ctx?: Ctx) => Promise<void> | void = noop,
  createContext?: () => Ctx
): Projector {
  let q = new Queue()
  let ctx = createContext?.()

  return {
    name,
    async init(es) {
      // Let's run the initializer
      await q.push(() => initializer(ctx))

      // Re-build the projection from scratch
      let events = await es.loadEvents<EventType<TPayload, TEventName>>()
      await Promise.all(
        events.map((event) =>
          q.push(() => mapper[event.eventName]?.(event as unknown as any, ctx))
        )
      )
    },
    update(event) {
      return q.push(() => mapper[event.eventName]?.(event, ctx))
    },
  }
}
