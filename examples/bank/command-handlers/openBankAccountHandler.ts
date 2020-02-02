import { Account } from '../Account';
import { OpenBankAccount } from '../commands';
import { EventSource } from '../../../src/createEventSource';

export async function openBankAccountHandler(
  command: OpenBankAccount,
  es: EventSource
) {
  const account = Account.open(command.payload.id, command.payload.name);

  return es.persist(account);
}
