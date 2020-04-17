import { abort } from './abort';
import { createError } from './create-error';

it('should be possible to throw an error with with extra properties using the abort utility', () => {
  expect(() => abort('My Error', { hello: 'world' })).toThrowError(
    createError('My Error', { hello: 'world' })
  );
});
