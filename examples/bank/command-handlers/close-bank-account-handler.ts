import { EventSource } from '@robinmalfait/event-source'

import { Account } from '../account'
import { closeBankAccount } from '../commands'

export async function closeBankAccountHandler(
  command: ReturnType<typeof closeBankAccount>,
  es: EventSource
) {
  return es.loadPersist(new Account(), command.payload.id, (account) => {
    account.close()
  })
}
