import { Account } from '../account'
import { openBankAccount } from '../commands'
import { EventSource } from '../../../src/create-event-source'

export async function openBankAccountHandler(
  command: ReturnType<typeof openBankAccount>,
  es: EventSource
) {
  return es.persist(Account.open(command.payload.id, command.payload.name))
}
