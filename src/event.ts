import { randomUUID } from 'crypto'

export interface EventType<T, N> {
  aggregateId: string
  eventId: string
  eventName: N
  payload: T
  recordedAt: Date
  version: number
}

export function Event<T, N>(
  eventName: N,
  aggregateId: string,
  payload: T
): EventType<T, N> {
  return {
    aggregateId,
    eventId: randomUUID(),
    eventName,
    payload,
    recordedAt: new Date(),
    version: -1,
  }
}
