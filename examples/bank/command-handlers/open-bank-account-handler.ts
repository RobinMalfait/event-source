import { Account } from '../account';
import { OpenBankAccount } from '../commands';
import { EventSource } from '../../../src/create-event-source';

export async function openBankAccountHandler(
  command: OpenBankAccount,
  es: EventSource
) {
  let account = Account.open(command.payload.id, command.payload.name);

  return es.persist(account);
}
