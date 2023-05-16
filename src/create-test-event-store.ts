import {
  CommandHandler,
  createEventSource,
  Projector,
} from '~/create-event-source'
import { EventType } from '~/event'
import { CommandType } from '~/command'
import { objectToYaml } from '~/utils/object-to-yaml'
import { abort } from '~/utils/abort'

let PLACEHOLDER = Symbol('__placeholder__')

let info = {
  usedTestEventStoreInTest: false,
  calledThenHandler: false,
}

if (process.env.NODE_ENV === 'test') {
  beforeEach(() => {
    info.usedTestEventStoreInTest = false
    info.calledThenHandler = false
  })

  afterEach(() => {
    if (info.usedTestEventStoreInTest && !info.calledThenHandler) {
      abort(
        'It seems like you used `createTestEventStore()`\nwithout using the `await then([expected, events, go, here, ...])`'
      )
    }
  })
}

function cleanThrow(cb: () => unknown, fn: Function) {
  try {
    return cb()
  } catch (e) {
    if (Error.captureStackTrace && e instanceof Error)
      Error.captureStackTrace(e, fn)
    throw e
  }
}

class TestRecordingProjector {
  name = 'test-recording-projector'

  constructor(
    public db: EventType<any, any>[] = [],
    public producedEvents: EventType<any, any>[] = []
  ) {}

  init() {
    this.db.splice(0)
  }

  update<T>(event: EventType<T, any>) {
    this.producedEvents.push(event)
  }
}

export function createTestEventStore(
  commandHandlers: Record<string, CommandHandler<any>>,
  projectors: Projector[] = []
) {
  info.usedTestEventStoreInTest = true

  let testRecordingProjector = new TestRecordingProjector()

  let es = createEventSource({
    store: {
      async load(aggregateId) {
        return testRecordingProjector.db.filter(
          (event) => event.aggregateId === aggregateId
        )
      },
      loadEvents() {
        return testRecordingProjector.db
      },
      persist(events) {
        testRecordingProjector.db.push(...events)
      },
    },
    commandHandlers: commandHandlers,
    projectors: [...projectors, testRecordingProjector],
  })

  let caughtError: Error

  let returnValue = {
    ___: PLACEHOLDER as any, // Expose as type `any` so that it is assignable to values
    async given(events: EventType<any, any>[] = []) {
      testRecordingProjector.db.push(...events)
    },
    async when<T>(
      command: CommandType<T> | (() => CommandType<T>)
    ): Promise<CommandType<T>> | never {
      try {
        return await es.dispatch(
          typeof command === 'function' ? command() : command
        )
      } catch (err) {
        if (err instanceof Error) {
          caughtError = err
        }
        // @ts-ignore
        return err
      }
    },
    async then<T>(expectation: EventType<T, any>[] | Error) {
      // Mark that we called the then function. If not we probably had a
      // successful test that actually didn't test anything!
      info.calledThenHandler = true

      // We expect errors, so let's verify the error
      if (expectation instanceof Error) {
        let error = expectation
        cleanThrow(() => expect(caughtError).toEqual(error), returnValue.then)
        return
      }

      let events = expectation

      // At this point, we expected some events, but we caught an error instead.
      // Therefore, we have to re-throw the error
      if (caughtError) {
        if (Object.keys(caughtError).length > 0) {
          caughtError.message = [
            'With properties:',
            `\n${objectToYaml(caughtError)}\n\n---\n\n`,
          ].join('\n')
        }

        throw caughtError
      }

      cleanThrow(() => {
        // Verify that the actual events and expected events have the same length
        expect(events).toHaveLength(
          testRecordingProjector.producedEvents.length
        )

        // Verify each individual event
        for (let [index, event] of events.entries()) {
          let { aggregateId, eventName, payload } =
            testRecordingProjector.producedEvents[index]

          expect(event.aggregateId).toEqual(aggregateId)
          expect(event.eventName).toEqual(eventName)

          if (event.payload === null || event.payload === undefined) {
            expect(event.payload).toEqual(payload)
          }

          for (let key in event.payload) {
            let value = event.payload[key] as any

            if (value === PLACEHOLDER) {
              expect(payload).toHaveProperty(key)
              expect(payload[key]).toBeDefined()
            } else {
              expect(payload[key]).toEqual(value)
            }
          }
        }
      }, returnValue.then)
    },
  }

  return returnValue
}
