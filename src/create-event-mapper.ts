import { EventType } from './event'
import { EventSource } from './create-event-source'

type EventMapper = Record<
  string,
  (event: EventType<any>, es: EventSource) => void
>

export function createEventMapper(mapper: EventMapper) {
  return (event: EventType<any>, es: EventSource) => {
    return mapper[event.eventName]?.(event, es)
  }
}
