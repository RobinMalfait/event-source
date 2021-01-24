import { Account } from '../account'
import { CloseBankAccount } from '../commands'
import { EventSource } from '../../../src/create-event-source'

export async function closeBankAccountHandler(
  command: CloseBankAccount,
  es: EventSource
) {
  return es.loadPersist(new Account(), command.payload.id, account => {
    account.close()
  })
}
