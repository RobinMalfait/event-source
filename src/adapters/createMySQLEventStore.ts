import Knex from 'knex';
import { EventStore } from '../createEventSource';
import { EventType } from '../Event';

export function createMySQLEventStore(db: Knex): EventStore {
  return {
    async load(aggregate_id) {
      const events = await db
        .select('*')
        .from('events')
        .where('aggregate_id', aggregate_id);

      return events.map(event => {
        event.payload = JSON.parse(event.payload);
        return event;
      });
    },
    async loadEvents() {
      const events = await db.select('*').from('events');

      return events.map(event => {
        event.payload = JSON.parse(event.payload);
        return event;
      });
    },
    persist(events: EventType<any>[]) {
      return db.transaction(trx => {
        events.forEach(event => {
          trx
            .insert({ ...event, payload: JSON.stringify(event.payload) })
            .into('events');
        });
      });
    },
  };
}
