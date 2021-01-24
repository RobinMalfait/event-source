import { Account } from '../account'
import { DepositMoney } from '../commands'
import { EventSource } from '../../../src/create-event-source'

export async function depositMoneyHandler(
  command: DepositMoney,
  es: EventSource
) {
  return es.loadPersist(new Account(), command.payload.id, account => {
    account.deposit(command.payload.amount)
  })
}
