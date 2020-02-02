import { uuid } from './uuid';

it('should generate a uuid v4 string', () => {
  expect(uuid()).toHaveLength(36);
  expect(uuid().charAt(14)).toBe('4'); // Should always be a 4
});
