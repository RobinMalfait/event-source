import { createTestEventStore } from '../../../src/createTestEventStore';
import { openBankAccountHandler } from '../command-handlers/openBankAccountHandler';
import { Commands, openBankAccount } from '../commands';
import { bankAccountHasBeenOpened } from '../events';

it('should be possible to open a bank account', async () => {
  const { given, when, then } = createTestEventStore({
    [Commands.OPEN_BANK_ACCOUNT]: openBankAccountHandler,
  });

  await given([]);
  const command = await when(openBankAccount('Jane Doe'));
  await then([bankAccountHasBeenOpened(command.payload.id, 'Jane Doe')]);
});
