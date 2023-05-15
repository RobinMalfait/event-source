import { Event } from '@robinmalfait/event-source'

export function bankAccountHasBeenOpened(id: string, name: string) {
  return Event('BANK_ACCOUNT_HAS_BEEN_OPENED', id, { name })
}

export function moneyWasDeposited(id: string, amount: number) {
  return Event('MONEY_WAS_DEPOSITED', id, { amount })
}

export function moneyWasWithdrawn(id: string, amount: number) {
  return Event('MONEY_WAS_WITHDRAWN', id, { amount })
}

export function bankAccountHasBeenClosed(id: string) {
  return Event('BANK_ACCOUNT_HAS_BEEN_CLOSED', id, {})
}
