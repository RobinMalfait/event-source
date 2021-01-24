import { Aggregate } from '../../src/aggregate';
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

enum State {
  OPEN,
  CLOSED,
}

export class Account extends Aggregate {
  private id: string;
  private balance: number;
  private state: State;

  static open(id: string, name: string) {
    let account = new Account();
    account.recordThat(bankAccountHasBeenOpened(id, name));
    return account;
  }

  deposit(amount: number) {
    if (this.state === State.CLOSED) {
      abort('Account has been closed', { id: this.id });
    }

    this.recordThat(moneyWasDeposited(this.id, amount));
  }

  withdraw(amount: number) {
    if (this.state === State.CLOSED) {
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
    if (this.state === State.CLOSED) {
      abort('Account has already been closed', { id: this.id });
    }

    this.recordThat(bankAccountHasBeenClosed(this.id));
  }

  [Events.BANK_ACCOUNT_HAS_BEEN_OPENED](event: BankAccountHasBeenOpened) {
    this.id = event.aggregateId;
    this.balance = 0;
    this.state = State.OPEN;
  }

  [Events.MONEY_WAS_DEPOSITED](event: MoneyWasDeposited) {
    this.balance += event.payload.amount;
  }

  [Events.MONEY_WAS_WITHDRAWN](event: MoneyWasWithdrawn) {
    this.balance -= event.payload.amount;
  }

  [Events.BANK_ACCOUNT_HAS_BEEN_CLOSED](_event: BankAccountHasBeenClosed) {
    this.state = State.CLOSED;
  }
}
