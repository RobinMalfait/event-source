import { createTestEventStore } from '../../../src/create-test-event-store';
import { withdrawMoneyHandler } from '../command-handlers/withdraw-money-handler';
import { Commands, withdrawMoney } from '../commands';
import {
  bankAccountHasBeenOpened,
  moneyWasDeposited,
  moneyWasWithdrawn,
  bankAccountHasBeenClosed,
} from '../events';
import { uuid } from '../../../src/utils/uuid';

it('should be possible to withdraw money from a bank account', async () => {
  const { given, when, then } = createTestEventStore({
    [Commands.WITHDRAW_MONEY]: withdrawMoneyHandler,
  });

  const id = uuid();

  await given([
    bankAccountHasBeenOpened(id, 'Jane Doe'),
    moneyWasDeposited(id, 5_000),
  ]);
  await when(withdrawMoney(id, 2_000));
  await then([moneyWasWithdrawn(id, 2_000)]);
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

it('should not be possible to withdraw money from closed a bank account', async () => {
  const { given, when, then } = createTestEventStore({
    [Commands.WITHDRAW_MONEY]: withdrawMoneyHandler,
  });

  const id = uuid();

  await given([
    bankAccountHasBeenOpened(id, 'Jane Doe'),
    bankAccountHasBeenClosed(id),
  ]);
  await when(withdrawMoney(id, 5_000));
  await then(new Error('Account has been closed'));
});
