import { Account } from '../account'
import { OpenBankAccount } from '../commands'
import { EventSource } from '../../../src/create-event-source'

export async function openBankAccountHandler(
  command: OpenBankAccount,
  es: EventSource
) {
  return es.persist(Account.open(command.payload.id, command.payload.name))
}
