import { uuid } from './utils/uuid';

export type EventType<T> = {
  aggregate_id: string;
  event_id: string;
  event_name: string;
  payload: T;
  recorded_at: Date;
};

export function Event<T>(
  event_name: string,
  aggregate_id: string,
  payload: T
): EventType<T> {
  return {
    aggregate_id,
    event_id: uuid(),
    event_name,
    payload,
    recorded_at: new Date(),
  };
}
