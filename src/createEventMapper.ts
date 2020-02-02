import { EventType } from './Event';
import { EventSource } from './createEventSource';

type EventMapper = Record<
  string,
  (event: EventType<any>, es: EventSource) => void
>;

export function createEventMapper(mapper: EventMapper) {
  return (event: EventType<any>, es: EventSource) => {
    if (!mapper[event.event_name] === undefined) {
      return;
    }

    return mapper[event.event_name](event, es);
  };
}
