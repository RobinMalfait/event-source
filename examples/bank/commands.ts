import { Command } from '../../src/Command';
import { uuid } from '../../src/utils/uuid';

export enum Commands {
  OPEN_BANK_ACCOUNT = 'OPEN_BANK_ACCOUNT',
  DEPOSIT_MONEY = 'DEPOSIT_MONEY',
  WITHDRAW_MONEY = 'WITHDRAW_MONEY',
}

export type OpenBankAccount = ReturnType<typeof openBankAccount>;
export function openBankAccount(name: string) {
  return Command(Commands.OPEN_BANK_ACCOUNT, {
    id: uuid(),
    name,
  });
}

export type DepositMoney = ReturnType<typeof depositMoney>;
export function depositMoney(id: string, amount: number) {
  return Command(Commands.DEPOSIT_MONEY, { id, amount });
}

export type WithdrawMoney = ReturnType<typeof withdrawMoney>;
export function withdrawMoney(id: string, amount: number) {
  return Command(Commands.WITHDRAW_MONEY, { id, amount });
}
