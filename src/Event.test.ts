import { Event } from './Event';
import { uuid } from './utils/uuid';

it('should return an event object', () => {
  expect(Event('my-event', uuid(), { some: 'payload' })).toEqual({
    event_name: 'my-event',
    aggregate_id: expect.stringContaining('-4'), // A uuid
    event_id: expect.stringContaining('-4'), // A uuid
    payload: {
      some: 'payload',
    },
    recorded_at: expect.any(Date),
  });
});
