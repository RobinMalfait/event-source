import { createTestEventStore } from '../../../src/createTestEventStore';
import { withdrawMoneyHandler } from '../command-handlers/withdrawMoneyHandler';
import { Commands, withdrawMoney } from '../commands';
import {
  bankAccountHasBeenOpened,
  moneyWasDeposited,
  moneyWasWithdrawn,
} from '../events';
import { uuid } from '../../../src/utils/uuid';

it('should be possible to withdraw money from a bank account', async () => {
  const { given, when, then } = createTestEventStore({
    [Commands.WITHDRAW_MONEY]: withdrawMoneyHandler,
  });

  const id = uuid();

  await given([
    bankAccountHasBeenOpened(id, 'Jane Doe'),
    moneyWasDeposited(id, 5000),
  ]);
  const command = await when(withdrawMoney(id, 2000));
  await then([moneyWasWithdrawn(command.payload.id, 2000)]);
});

it('should not be possible to withdraw money from a bank account that has insufficient funds', async () => {
  const { given, when, then } = createTestEventStore({
    [Commands.WITHDRAW_MONEY]: withdrawMoneyHandler,
  });

  const id = uuid();

  await given([
    bankAccountHasBeenOpened(id, 'Jane Doe'),
    moneyWasDeposited(id, 5_000),
  ]);
  await when(withdrawMoney(id, 10_000));
  await then(new Error('Not enough money to withdraw money'));
});
