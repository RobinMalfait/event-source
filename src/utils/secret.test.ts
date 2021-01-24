import { set, get } from './secret';

it('should be possible to store a "secret" value for a certain object', () => {
  let myObject = {};
  let secret = { some: 'secret' };

  // Store a secret value for this object
  set(myObject, secret);

  // Ensure the `some` key is not on our object
  expect(myObject).not.toHaveProperty('some');

  // Retrieve a secret value for this object
  expect(get(myObject)).toBe(secret);
});
