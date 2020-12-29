import { createTestEventStore } from '../../../src/create-test-event-store';
import { openBankAccountHandler } from '../command-handlers/open-bank-account-handler';
import { Commands, openBankAccount } from '../commands';
import { bankAccountHasBeenOpened } from '../events';

it('should be possible to open a bank account', async () => {
  let { given, when, then } = createTestEventStore({
    [Commands.OPEN_BANK_ACCOUNT]: openBankAccountHandler,
  });

  await given([]);
  let command = await when(openBankAccount('Jane Doe'));
  await then([bankAccountHasBeenOpened(command.payload.id, 'Jane Doe')]);
});
