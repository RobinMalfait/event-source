import { Account } from '../Account';
import { WithdrawMoney } from '../commands';
import { EventSource } from '../../../src/create-event-source';

export async function withdrawMoneyHandler(
  command: WithdrawMoney,
  es: EventSource
) {
  const account = await es.load(new Account(), command.payload.id);

  account.withdraw(command.payload.amount);

  return es.persist(account);
}
