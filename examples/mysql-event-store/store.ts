import { Knex } from 'knex'
import { EventStore, EventType } from '@robinmalfait/event-source'

interface DBEvent {
  event_id: string
  event_name: string
  recorded_at: Date
  aggregate_id: string
  version: number
  payload: string
}

function toDB<T>(event: EventType<T, string>): DBEvent {
  let { eventId, eventName, aggregateId, recordedAt, payload, version } = event
  return {
    event_id: eventId,
    event_name: eventName,
    recorded_at: recordedAt,
    aggregate_id: aggregateId,
    version,
    payload: JSON.stringify(payload),
  }
}

export function fromDB<T>(event: DBEvent): EventType<T, string> {
  let { event_id, event_name, recorded_at, aggregate_id, payload, version } =
    event
  return {
    eventId: event_id,
    eventName: event_name,
    recordedAt: recorded_at,
    aggregateId: aggregate_id,
    version,
    payload: JSON.parse(payload),
  }
}

export function createMySQLEventStore(db: Knex): EventStore {
  return {
    async load<T>(aggregateId: string) {
      let events = await db
        .select('*')
        .from('events')
        .where('aggregate_id', aggregateId)
      return events.map(fromDB) as EventType<T, string>[]
    },
    async loadEvents<T>() {
      let events = await db.select('*').from('events')
      return events.map(fromDB) as EventType<T, string>[]
    },
    persist(events: EventType<unknown, unknown>[]) {
      return db.insert(events.map(toDB)).into('events')
    },
  }
}
