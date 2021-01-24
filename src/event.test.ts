import { Event } from './event'
import { uuid } from './utils/uuid'

it('should return an event object', () => {
  expect(Event('my-event', uuid(), { some: 'payload' })).toEqual({
    eventName: 'my-event',
    aggregateId: expect.stringContaining('-4'), // A uuid
    eventId: expect.stringContaining('-4'), // A uuid
    payload: { some: 'payload' },
    recordedAt: expect.any(Date),
  })
})
