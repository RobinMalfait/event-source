import { uuid } from './utils/uuid'

export interface EventType<T> {
  aggregateId: string
  eventId: string
  eventName: string
  payload: T
  recordedAt: Date
}

export function Event<T>(
  eventName: string,
  aggregateId: string,
  payload: T
): EventType<T> {
  return {
    aggregateId,
    eventId: uuid(),
    eventName,
    payload,
    recordedAt: new Date(),
  }
}
