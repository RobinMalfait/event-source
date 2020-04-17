import { Account } from '../Account';
import { CloseBankAccount } from '../commands';
import { EventSource } from '../../../src/create-event-source';

export async function closeBankAccountHandler(
  command: CloseBankAccount,
  es: EventSource
) {
  const account = await es.load(new Account(), command.payload.id);

  account.close();

  return es.persist(account);
}
