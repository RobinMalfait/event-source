import { randomUUID } from 'crypto'

import { Event } from './event'

it('should return an event object', () => {
  expect(Event('my-event', randomUUID(), { some: 'payload' })).toEqual({
    eventName: 'my-event',
    aggregateId: expect.stringContaining('-4'), // A uuid
    eventId: expect.stringContaining('-4'), // A uuid
    payload: { some: 'payload' },
    recordedAt: expect.any(Date),
    version: expect.any(Number),
  })
})
