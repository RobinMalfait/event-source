import { Command } from './Command';

it('should return a command object', () => {
  expect(Command('my-command', { some: 'arguments', go: 'here' })).toEqual({
    type: 'my-command',
    payload: {
      some: 'arguments',
      go: 'here',
    },
  });
});
