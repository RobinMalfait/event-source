import { EventSource } from '@robinmalfait/event-source'

import { Account } from '../account'
import { depositMoney } from '../commands'

export async function depositMoneyHandler(
  command: ReturnType<typeof depositMoney>,
  es: EventSource
) {
  return es.loadPersist(new Account(), command.payload.id, (account) => {
    account.deposit(command.payload.amount)
  })
}
