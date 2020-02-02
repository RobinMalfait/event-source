import { createTestEventStore } from '../../../src/createTestEventStore';
import { depositMoneyHandler } from '../command-handlers/depositMoneyHandler';
import { Commands, depositMoney } from '../commands';
import { bankAccountHasBeenOpened, moneyWasDeposited } from '../events';
import { uuid } from '../../../src/utils/uuid';

it('should be possible to deposit money on a bank account', async () => {
  const { given, when, then } = createTestEventStore({
    [Commands.DEPOSIT_MONEY]: depositMoneyHandler,
  });

  const id = uuid();

  await given([bankAccountHasBeenOpened(id, 'Jane Doe')]);
  const command = await when(depositMoney(id, 5_000));
  await then([moneyWasDeposited(command.payload.id, 5_000)]);
});
