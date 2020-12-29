import { Account } from '../account';
import { DepositMoney } from '../commands';
import { EventSource } from '../../../src/create-event-source';

export async function depositMoneyHandler(
  command: DepositMoney,
  es: EventSource
) {
  let account = await es.load(new Account(), command.payload.id);

  account.deposit(command.payload.amount);

  return es.persist(account);
}
