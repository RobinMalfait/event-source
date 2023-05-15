import { randomUUID } from 'crypto'
import { createTestEventStore } from '@robinmalfait/event-source'

import { withdrawMoneyHandler } from '../command-handlers/withdraw-money-handler'
import { withdrawMoney } from '../commands'
import {
  bankAccountHasBeenOpened,
  moneyWasDeposited,
  moneyWasWithdrawn,
  bankAccountHasBeenClosed,
} from '../events'

it('should be possible to withdraw money from a bank account', async () => {
  let { given, when, then } = createTestEventStore({
    WITHDRAW_MONEY: withdrawMoneyHandler,
  })

  let id = randomUUID()

  await given([
    bankAccountHasBeenOpened(id, 'Jane Doe'),
    moneyWasDeposited(id, 5_000),
  ])
  await when(withdrawMoney(id, 2_000))
  await then([moneyWasWithdrawn(id, 2_000)])
})

it('should not be possible to withdraw money from a bank account that has insufficient funds', async () => {
  let { given, when, then } = createTestEventStore({
    WITHDRAW_MONEY: withdrawMoneyHandler,
  })

  let id = randomUUID()

  await given([
    bankAccountHasBeenOpened(id, 'Jane Doe'),
    moneyWasDeposited(id, 5_000),
  ])
  await when(withdrawMoney(id, 10_000))
  await then(new Error('Not enough money to withdraw money'))
})

it('should not be possible to withdraw money from closed a bank account', async () => {
  let { given, when, then } = createTestEventStore({
    WITHDRAW_MONEY: withdrawMoneyHandler,
  })

  let id = randomUUID()

  await given([
    bankAccountHasBeenOpened(id, 'Jane Doe'),
    bankAccountHasBeenClosed(id),
  ])
  await when(withdrawMoney(id, 5_000))
  await then(new Error('Account has been closed'))
})
