import { abort, Aggregate } from '@robinmalfait/event-source'
import {
  bankAccountHasBeenOpened,
  moneyWasDeposited,
  moneyWasWithdrawn,
  bankAccountHasBeenClosed,
} from './events'

enum State {
  OPEN,
  CLOSED,
}

export class Account extends Aggregate {
  private id: string
  private balance: number
  private state: State

  static open(id: string, name: string) {
    return new Account().recordThat(bankAccountHasBeenOpened(id, name))
  }

  deposit(amount: number) {
    if (this.state === State.CLOSED) {
      abort('Account has been closed', { id: this.id })
    }

    this.recordThat(moneyWasDeposited(this.id, amount))
  }

  withdraw(amount: number) {
    if (this.state === State.CLOSED) {
      abort('Account has been closed', { id: this.id })
    }

    if (amount > this.balance) {
      abort('Not enough money to withdraw money', {
        id: this.id,
        balance: this.balance,
        amount,
      })
    }

    this.recordThat(moneyWasWithdrawn(this.id, amount))
  }

  close() {
    if (this.state === State.CLOSED) {
      abort('Account has already been closed', { id: this.id })
    }

    this.recordThat(bankAccountHasBeenClosed(this.id))
  }

  BANK_ACCOUNT_HAS_BEEN_OPENED(
    event: ReturnType<typeof bankAccountHasBeenOpened>
  ) {
    this.id = event.aggregateId
    this.balance = 0
    this.state = State.OPEN
  }

  MONEY_WAS_DEPOSITED(event: ReturnType<typeof moneyWasDeposited>) {
    this.balance += event.payload.amount
  }

  MONEY_WAS_WITHDRAWN(event: ReturnType<typeof moneyWasWithdrawn>) {
    this.balance -= event.payload.amount
  }

  BANK_ACCOUNT_HAS_BEEN_CLOSED(
    _event: ReturnType<typeof bankAccountHasBeenClosed>
  ) {
    this.state = State.CLOSED
  }
}
