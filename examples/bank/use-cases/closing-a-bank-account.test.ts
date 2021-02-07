import { randomUUID } from 'crypto'
import { createTestEventStore } from '../../../src/create-test-event-store'
import { Commands, closeBankAccount } from '../commands'
import { bankAccountHasBeenOpened, bankAccountHasBeenClosed } from '../events'
import { closeBankAccountHandler } from '../command-handlers/close-bank-account-handler'

it('should be possible to close a bank account', async () => {
  let { given, when, then } = createTestEventStore({
    [Commands.CLOSE_BANK_ACCOUNT]: closeBankAccountHandler,
  })

  let id = randomUUID()

  await given([bankAccountHasBeenOpened(id, 'Jane Doe')])
  await when(closeBankAccount(id))
  await then([bankAccountHasBeenClosed(id)])
})

it('should not be possible to close a bank account that has already been closed', async () => {
  let { given, when, then } = createTestEventStore({
    [Commands.CLOSE_BANK_ACCOUNT]: closeBankAccountHandler,
  })

  let id = randomUUID()

  await given([
    bankAccountHasBeenOpened(id, 'Jane Doe'),
    bankAccountHasBeenClosed(id),
  ])
  await when(closeBankAccount(id))
  await then(new Error('Account has already been closed'))
})
