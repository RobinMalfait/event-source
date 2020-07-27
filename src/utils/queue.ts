import { get, set } from './secret';
import { uuid } from './uuid';

type UnitOfWork = {
  unit: () => void;
  resolve: (value: unknown) => unknown;
  reject: (value: unknown) => unknown;
};

type QueueSecret = {
  queue: Array<UnitOfWork>;
  state: State;
  id: string;
};

enum State {
  STARTED,
  NEUTRAL,
}

function start(instance: Queue): Promise<any> {
  set<State>(instance, State.STARTED);

  return new Promise((resolveStart, rejectStart) => {
    setImmediate(() => {
      const { queue } = get<QueueSecret>(instance);

      if (queue.length > 0) {
        const { unit, resolve, reject } = queue.shift()!;

        // Handle the unit
        const resolved = Promise.resolve(unit());

        // Resolve / reject the push unit
        resolved.then(resolve, reject);

        // Handle the next item
        resolved.then(resolveStart, rejectStart).then(() => start(instance));
      }

      set<State>(instance, State.NEUTRAL);
    });
  });
}

export class Queue {
  constructor() {
    set<QueueSecret>(this, {
      queue: [],
      state: State.NEUTRAL,
      id: uuid(),
    });
  }

  get length(): number {
    return get<QueueSecret>(this).queue.length;
  }

  push(unit: () => void): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const { queue, state } = get<QueueSecret>(this);
      const unit_of_work: UnitOfWork = {
        unit,
        resolve,
        reject,
      };

      queue.push(unit_of_work);

      if (state === State.NEUTRAL) {
        start(this);
      }
    });
  }
}
