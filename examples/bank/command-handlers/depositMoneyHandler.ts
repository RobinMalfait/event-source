import { Account } from '../Account';
import { DepositMoney } from '../commands';
import { EventSource } from '../../../src/createEventSource';

export async function depositMoneyHandler(
  command: DepositMoney,
  es: EventSource
) {
  const account = await es.load(new Account(), command.payload.id);

  account.deposit(command.payload.amount);

  return es.persist(account);
}
