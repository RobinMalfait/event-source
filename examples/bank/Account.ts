import { Aggregate } from '../../src/Aggregate';
import {
  BankAccountHasBeenOpened,
  bankAccountHasBeenOpened,
  Events,
  moneyWasDeposited,
  MoneyWasDeposited,
  moneyWasWithdrawn,
  MoneyWasWithdrawn,
  bankAccountHasBeenClosed,
  BankAccountHasBeenClosed,
} from './events';
import { abort } from '../../src/utils/abort';

export class Account extends Aggregate {
  private id: string;
  private balance: number;
  private closed: boolean;

  static open(id: string, name: string) {
    const account = new Account();
    account.recordThat(bankAccountHasBeenOpened(id, name));
    return account;
  }

  deposit(amount: number) {
    if (this.closed) {
      abort('Account has been closed', { id: this.id });
    }

    this.recordThat(moneyWasDeposited(this.id, amount));
  }

  withdraw(amount: number) {
    if (this.closed) {
      abort('Account has been closed', { id: this.id });
    }

    if (amount > this.balance) {
      abort('Not enough money to withdraw money', {
        id: this.id,
        balance: this.balance,
        amount,
      });
    }

    this.recordThat(moneyWasWithdrawn(this.id, amount));
  }

  close() {
    if (this.closed) {
      abort('Account has already been closed', { id: this.id });
    }

    this.recordThat(bankAccountHasBeenClosed(this.id));
  }

  [Events.BANK_ACCOUNT_HAS_BEEN_OPENED](event: BankAccountHasBeenOpened) {
    this.id = event.aggregate_id;
    this.balance = 0;
    this.closed = false;
  }

  [Events.MONEY_WAS_DEPOSITED](event: MoneyWasDeposited) {
    this.balance += event.payload.amount;
  }

  [Events.MONEY_WAS_WITHDRAWN](event: MoneyWasWithdrawn) {
    this.balance -= event.payload.amount;
  }

  [Events.BANK_ACCOUNT_HAS_BEEN_CLOSED](_event: BankAccountHasBeenClosed) {
    this.closed = true;
  }
}
