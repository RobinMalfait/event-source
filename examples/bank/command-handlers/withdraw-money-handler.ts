import { Account } from '../account'
import { WithdrawMoney } from '../commands'
import { EventSource } from '../../../src/create-event-source'

export async function withdrawMoneyHandler(
  command: WithdrawMoney,
  es: EventSource
) {
  return es.loadPersist(new Account(), command.payload.id, account => {
    account.withdraw(command.payload.amount)
  })
}
