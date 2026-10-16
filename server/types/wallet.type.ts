export enum TWalletStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export enum TCurrency {
  INR = "INR",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
}

export enum TTransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export enum TTransactionCategory {
  DEPOSIT = "DEPOSIT",
  TRANSFER = "TRANSFER",
}

export enum TTransactionFilterType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
  TRANSFER = "TRANSFER",
}

export type TCreateWallet = {
  currency: TCurrency;
};

export type TDeposit = {
  amount: number;
  referenceId: string;
  description?: string;
};

export type TTransfer = TDeposit & {
  toUserId: number;
};

export type TTransactionFilter = {
  page: number;
  limit: number;
  type?: TTransactionFilterType;
  fromDate?: Date;
  toDate?: Date;
};
