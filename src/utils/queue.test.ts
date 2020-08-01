import { Queue } from './queue';

it('should be possible to create a Queue instance', () => {
  expect(new Queue()).toBeInstanceOf(Queue);
});

it('should be possible to push something to the Queue', () => {
  const q = new Queue();
  const fn = jest.fn();

  q.push(fn);

  expect(q.length).toBe(1);
});

it('should return a promise when pushing to the Queue', () => {
  const q = new Queue();
  const fn = jest.fn();

  const returnValue = q.push(() => {
    fn();
  });

  expect(returnValue).toBeInstanceOf(Promise);
});

it('should be possible to push something to the Queue and wait for it to be handled', async () => {
  const q = new Queue();
  const fn = jest.fn();

  const returnValue = q.push(fn);

  expect(q.length).toBe(1);

  await returnValue;

  expect(fn).toHaveBeenCalled();
  expect(q.length).toBe(0);
});

it('should run every item pushed to the queue in order', async () => {
  const q = new Queue();
  const fn = jest.fn();

  q.push(() => {
    fn(1);
  });

  q.push(() => {
    fn(2);
  });

  await q.push(() => {
    fn(3);
  });

  expect(fn.mock.calls).toEqual([[1], [2], [3]]);
});

// This part guarantees the order of execution and that we are actually DONE
it('should wait to handle the next item if the unit of work returns a promise', async () => {
  const q = new Queue();
  const fn = jest.fn();

  q.push(() => {
    fn(1);
  });

  q.push(() => {
    fn(2);

    return new Promise(resolve => {
      setTimeout(() => {
        fn(2.5);
        resolve();
      }, 100);
    });
  });

  await q.push(() => {
    fn(3);
  });

  expect(fn.mock.calls).toEqual([[1], [2], [2.5], [3]]);
});

it('should be possible to catch errors', async () => {
  const q = new Queue();
  const fn = jest.fn();

  await q
    .push(() => {
      throw new Error('Catch me if you can!');
    })
    .catch(fn);

  expect(fn).toHaveBeenCalledWith(new Error('Catch me if you can!'));
});
