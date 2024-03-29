import { createTestEventStore } from '@robinmalfait/event-source'

import { openBankAccountHandler } from '../command-handlers/open-bank-account-handler'
import { openBankAccount } from '../commands'
import { bankAccountHasBeenOpened } from '../events'

it('should be possible to open a bank account', async () => {
  let { given, when, then } = createTestEventStore({
    OPEN_BANK_ACCOUNT: openBankAccountHandler,
  })

  await given([])
  let command = await when(openBankAccount('Jane Doe'))
  await then([bankAccountHasBeenOpened(command.payload.id, 'Jane Doe')])
})
