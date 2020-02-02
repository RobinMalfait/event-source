import { Event } from '../../src/Event';

export enum Events {
  BANK_ACCOUNT_HAS_BEEN_OPENED = 'BANK_ACCOUNT_HAS_BEEN_OPENED',
  MONEY_WAS_DEPOSITED = 'MONEY_WAS_DEPOSITED',
  MONEY_WAS_WITHDRAWN = 'MONEY_WAS_WITHDRAWN',
}

export type BankAccountHasBeenOpened = ReturnType<
  typeof bankAccountHasBeenOpened
>;
export function bankAccountHasBeenOpened(id: string, name: string) {
  return Event(Events.BANK_ACCOUNT_HAS_BEEN_OPENED, id, { name });
}

export type MoneyWasDeposited = ReturnType<typeof moneyWasDeposited>;
export function moneyWasDeposited(id: string, amount: number) {
  return Event(Events.MONEY_WAS_DEPOSITED, id, { amount });
}

export type MoneyWasWithdrawn = ReturnType<typeof moneyWasWithdrawn>;
export function moneyWasWithdrawn(id: string, amount: number) {
  return Event(Events.MONEY_WAS_WITHDRAWN, id, { amount });
}
