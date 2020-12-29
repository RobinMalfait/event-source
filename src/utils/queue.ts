import { get, set } from './secret';

type Job = {
  handle: () => void;
  resolve: (value: unknown) => unknown;
  reject: (value: unknown) => unknown;
};

type QueueSecret = {
  jobs: Job[];
  state: State;
};

enum State {
  IDLE,
  STARTED,
}

export class Queue {
  constructor() {
    set<QueueSecret>(this, { jobs: [], state: State.IDLE });
  }

  get length(): number {
    return get<QueueSecret>(this).jobs.length;
  }

  async start() {
    let { state, jobs } = get<QueueSecret>(this);

    if (state === State.STARTED || jobs.length <= 0) {
      return;
    }

    set<QueueSecret>(this, { state: State.STARTED });

    while (jobs.length > 0) {
      let job = jobs.shift()!;

      // Handle the job
      let settled = Promise.resolve().then(() => job.handle());

      // Resolve / reject the job promise wrapper
      await settled.then(job.resolve, job.reject);
    }

    set<QueueSecret>(this, { state: State.IDLE });
  }

  push(handle: Job['handle']): Promise<unknown> {
    return new Promise((resolve, reject) => {
      let { jobs } = get<QueueSecret>(this);
      jobs.push({ handle, resolve, reject });
      setImmediate(() => this.start());
    });
  }
}
