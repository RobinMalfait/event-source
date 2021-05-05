import { Account } from '../account'
import { closeBankAccount } from '../commands'
import { EventSource } from '../../../src/create-event-source'

export async function closeBankAccountHandler(
  command: ReturnType<typeof closeBankAccount>,
  es: EventSource
) {
  return es.loadPersist(new Account(), command.payload.id, account => {
    account.close()
  })
}
