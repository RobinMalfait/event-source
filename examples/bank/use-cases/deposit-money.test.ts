import { randomUUID } from 'crypto'
import { createTestEventStore } from '@robinmalfait/event-source'

import { depositMoneyHandler } from '../command-handlers/deposit-money-handler'
import { depositMoney } from '../commands'
import {
  bankAccountHasBeenOpened,
  moneyWasDeposited,
  bankAccountHasBeenClosed,
} from '../events'

it('should be possible to deposit money on a bank account', async () => {
  let { given, when, then } = createTestEventStore({
    DEPOSIT_MONEY: depositMoneyHandler,
  })

  let id = randomUUID()

  await given([bankAccountHasBeenOpened(id, 'Jane Doe')])
  await when(depositMoney(id, 5_000))
  await then([moneyWasDeposited(id, 5_000)])
})

it('should not be possible to deposit money to closed a bank account', async () => {
  let { given, when, then } = createTestEventStore({
    DEPOSIT_MONEY: depositMoneyHandler,
  })

  let id = randomUUID()

  await given([
    bankAccountHasBeenOpened(id, 'Jane Doe'),
    bankAccountHasBeenClosed(id),
  ])
  await when(depositMoney(id, 5_000))
  await then(new Error('Account has been closed'))
})
