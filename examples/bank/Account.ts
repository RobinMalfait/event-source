import { Aggregate } from '../../src/Aggregate';
import {
  BankAccountHasBeenOpened,
  bankAccountHasBeenOpened,
  Events,
  moneyWasDeposited,
  MoneyWasDeposited,
  moneyWasWithdrawn,
  MoneyWasWithdrawn,
} from './events';
import { fail } from '../../src/utils/fail';

export class Account extends Aggregate {
  private id: string;
  private balance: number;

  static open(id: string, name: string) {
    const account = new Account();
    account.recordThat(bankAccountHasBeenOpened(id, name));
    return account;
  }

  deposit(amount: number) {
    this.recordThat(moneyWasDeposited(this.id, amount));
  }

  withdraw(amount: number) {
    if (amount > this.balance) {
      fail('Not enough money to withdraw money', {
        id: this.id,
        balance: this.balance,
        amount,
      });
    }

    this.recordThat(moneyWasWithdrawn(this.id, amount));
  }

  [Events.BANK_ACCOUNT_HAS_BEEN_OPENED](event: BankAccountHasBeenOpened) {
    this.id = event.aggregate_id;
    this.balance = 0;
  }

  [Events.MONEY_WAS_DEPOSITED](event: MoneyWasDeposited) {
    this.balance += event.payload.amount;
  }

  [Events.MONEY_WAS_WITHDRAWN](event: MoneyWasWithdrawn) {
    this.balance -= event.payload.amount;
  }
}
