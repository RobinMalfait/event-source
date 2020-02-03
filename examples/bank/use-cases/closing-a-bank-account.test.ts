import { createTestEventStore } from '../../../src/createTestEventStore';
import { Commands, closeBankAccount } from '../commands';
import { bankAccountHasBeenOpened, bankAccountHasBeenClosed } from '../events';
import { uuid } from '../../../src/utils/uuid';
import { closeBankAccountHandler } from '../command-handlers/closeBankAccountHandler';

it('should be possible to close a bank account', async () => {
  const { given, when, then } = createTestEventStore({
    [Commands.CLOSE_BANK_ACCOUNT]: closeBankAccountHandler,
  });

  const id = uuid();

  await given([bankAccountHasBeenOpened(id, 'Jane Doe')]);
  await when(closeBankAccount(id));
  await then([bankAccountHasBeenClosed(id)]);
});

it('should not be possible to close a bank account that has already been closed', async () => {
  const { given, when, then } = createTestEventStore({
    [Commands.CLOSE_BANK_ACCOUNT]: closeBankAccountHandler,
  });

  const id = uuid();

  await given([
    bankAccountHasBeenOpened(id, 'Jane Doe'),
    bankAccountHasBeenClosed(id),
  ]);
  await when(closeBankAccount(id));
  await then(new Error('Account has already been closed'));
});
