import { Account } from '../account'
import { withdrawMoney } from '../commands'
import { EventSource } from '../../../src/create-event-source'

export async function withdrawMoneyHandler(
  command: ReturnType<typeof withdrawMoney>,
  es: EventSource
) {
  return es.loadPersist(new Account(), command.payload.id, account => {
    account.withdraw(command.payload.amount)
  })
}
