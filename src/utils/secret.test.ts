import { set, get } from './secret';

it('should be possible to store a "secret" value for a certain object', () => {
  const my_object = {};
  const secret = {
    some: 'secret',
  };

  // Store a secret value for this object
  set(my_object, secret);

  // Ensure the `some` key is not on our object
  expect(my_object).not.toHaveProperty('some');

  // Retrieve a secret value for this object
  expect(get(my_object)).toBe(secret);
});
