import { fail } from './fail';
import { createError } from './createError';

it('should be possible to throw an error with with extra properties using the fail utility', () => {
  expect(() => fail('My Error', { hello: 'world' })).toThrowError(
    createError('My Error', { hello: 'world' })
  );
});
