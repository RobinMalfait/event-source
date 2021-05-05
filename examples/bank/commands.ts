import { randomUUID } from 'crypto'

import { Command } from '../../src/command'

export function openBankAccount(name: string) {
  return Command('OPEN_BANK_ACCOUNT', { id: randomUUID(), name })
}

export function depositMoney(id: string, amount: number) {
  return Command('DEPOSIT_MONEY', { id, amount })
}

export function withdrawMoney(id: string, amount: number) {
  return Command('WITHDRAW_MONEY', { id, amount })
}

export function closeBankAccount(id: string) {
  return Command('CLOSE_BANK_ACCOUNT', { id })
}
