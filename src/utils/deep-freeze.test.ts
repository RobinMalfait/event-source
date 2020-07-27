import { deepFreeze } from './deep-freeze';

it('should be possible to freeze a shallow object', () => {
  const obj = deepFreeze({ a: 1 });

  expect(obj).toEqual({ a: 1 });

  // It should error when you try to mutate it
  expect(() => {
    obj.a++;
  }).toThrowError();
});

it('should be possible to freeze a shallow array', () => {
  const obj = deepFreeze([1, 2, 3]);

  expect(obj).toEqual([1, 2, 3]);

  // It should error when you try to mutate it
  expect(() => {
    obj.push(4);
  }).toThrowError();
});

it('should be possible to freeze a nested object', () => {
  const obj = deepFreeze({ a: { b: { c: 1 } } });

  expect(obj).toEqual({ a: { b: { c: 1 } } });

  // It should error when you try to mutate it
  expect(() => {
    obj.a.b.c++;
  }).toThrowError();
});
