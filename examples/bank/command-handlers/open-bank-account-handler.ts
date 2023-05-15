import { EventSource } from '@robinmalfait/event-source'

import { Account } from '../account'
import { openBankAccount } from '../commands'

export async function openBankAccountHandler(
  command: ReturnType<typeof openBankAccount>,
  es: EventSource
) {
  return es.persist(Account.open(command.payload.id, command.payload.name))
}
