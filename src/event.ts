import { randomUUID } from 'crypto'

export interface EventType<T> {
  aggregateId: string
  eventId: string
  eventName: string
  payload: T
  recordedAt: Date
  version: number
}

export function Event<T>(
  eventName: string,
  aggregateId: string,
  payload: T
): EventType<T> {
  return {
    aggregateId,
    eventId: randomUUID(),
    eventName,
    payload,
    recordedAt: new Date(),
    version: -1,
  }
}
