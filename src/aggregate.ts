import { EventType } from './event'
import { abort } from './utils/abort'
import { deepFreeze } from './utils/deep-freeze'

let env = { NODE_ENV: process.env.NODE_ENV }

export class Aggregate {
  private version: number = 0
  private recordedEvents: EventType<unknown, any>[] = []

  public replayEvents<T>(events: EventType<T, any>[] = []) {
    for (let event of events) this.applyAnEvent(event)
    return this
  }

  private applyAnEvent<T>(event: EventType<T, any>) {
    if (env.NODE_ENV === 'test') deepFreeze(event)

    if ((this as any)[event.eventName] === undefined) {
      if (event.eventName.match(/^[$A-Z_][0-9A-Z_$]*$/i)) {
        abort(
          `Aggregate "${this.constructor.name}" has no method:\n\n${event.eventName}(event) {\n\t// Code goes here...\n}`
        )
      } else {
        abort(
          `Aggregate "${this.constructor.name}" has no method:\n\n['${event.eventName}'](event) {\n\t// Code goes here...\n}`
        )
      }
    }

    try {
      ;(this as any)[event.eventName](event)
    } catch (err) {
      if (err instanceof Error) {
        console.error(
          `An error occurred inside your "%s" function:\n`,
          event.eventName,
          err.stack
            ?.split('\n')
            .map((line: string) => `  ${line}`)
            .join('\n')
        )
      }
    } finally {
      this.version++
    }

    return this
  }

  protected recordThat<T>(event: EventType<T, any>) {
    let eventToStore = {
      ...event,
      version: this.version,
    }

    this.applyAnEvent(eventToStore)
    this.recordedEvents.push(eventToStore)

    return this
  }

  public releaseEvents() {
    return this.recordedEvents.splice(0)
  }
}
