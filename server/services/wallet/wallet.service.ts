import httpStatusCodes from "http-status-codes";
import { EntityManager, In } from "typeorm";
import { AppDataSource } from "../../data-source/data-source";
import {
  WalletRepository,
  WalletTransactionRepository,
} from "../../data-source/repository";
import { WalletTransaction } from "../../entities/wallet/wallet-transaction.entity";
import { Wallet } from "../../entities/wallet/wallet.entity";
import { StringError } from "../../errors/string.error";
import {
  TCreateWallet,
  TDeposit,
  TTransactionCategory,
  TTransactionFilter,
  TTransactionFilterType,
  TTransactionType,
  TTransfer,
  TWalletStatus,
} from "../../types/wallet.type";
import ApiUtility from "../../utilities/api.utility";
import { isDuplicateEntryError } from "../../utilities/common.utility";
import { toEndOfDay } from "../../utilities/date-time.utility";
import MoneyUtility from "../../utilities/money.utility";

const duplicateReferenceError = () =>
  new StringError(
    "referenceId has already been used for a different request",
    httpStatusCodes.CONFLICT
  );

const withReferenceGuard = async <T>(work: () => Promise<T>) => {
  try {
    return await work();
  } catch (e) {
    if (isDuplicateEntryError(e)) {
      throw duplicateReferenceError();
    }
    throw e;
  }
};

const findActiveWallet = (
  userId: number,
  manager: EntityManager = AppDataSource.manager
) => {
  return manager.findOne(Wallet, {
    where: { userId, status: TWalletStatus.ACTIVE },
  });
};

const getActiveWallet = async (userId: number) => {
  const wallet = await findActiveWallet(userId);
  if (!wallet) {
    throw new StringError(
      "No active wallet found for this user",
      httpStatusCodes.NOT_FOUND
    );
  }
  return wallet;
};

const lockWallets = (manager: EntityManager, walletIds: number[]) => {
  return manager.find(Wallet, {
    where: { id: In(walletIds) },
    order: { id: "ASC" },
    lock: { mode: "pessimistic_write" },
  });
};

const ensureActive = (wallet: Wallet | undefined, message: string) => {
  if (!wallet || wallet.status !== TWalletStatus.ACTIVE) {
    throw new StringError(message, httpStatusCodes.FORBIDDEN);
  }
  return wallet;
};

const findByReference = (manager: EntityManager, referenceId: string) => {
  return manager.find(WalletTransaction, { where: { referenceId } });
};

const formatWallet = (wallet: Wallet) => ({
  walletId: wallet.id,
  userId: wallet.userId,
  balance: wallet.balance,
  currency: wallet.currency,
  status: wallet.status,
});

const createWallet = async (userId: number, params: TCreateWallet) => {
  const existingWallet = await findActiveWallet(userId);
  if (existingWallet) {
    throw new StringError(
      "User already has an active wallet",
      httpStatusCodes.CONFLICT
    );
  }

  const wallet = WalletRepository.create({
    userId,
    currency: params.currency,
    balance: 0,
    status: TWalletStatus.ACTIVE,
  });

  try {
    await WalletRepository.save(wallet);
  } catch (e) {
    if (isDuplicateEntryError(e)) {
      throw new StringError(
        "User already has an active wallet",
        httpStatusCodes.CONFLICT
      );
    }
    throw e;
  }

  return formatWallet(wallet);
};

const deposit = async (userId: number, params: TDeposit) => {
  const { id: walletId } = await getActiveWallet(userId);

  return withReferenceGuard(() =>
    AppDataSource.transaction(async (manager) => {
      const [lockedWallet] = await lockWallets(manager, [walletId]);
      const wallet = ensureActive(lockedWallet, "Wallet is not active");

      const existing = await findByReference(manager, params.referenceId);
      if (existing.length) {
        const [previous] = existing;
        const isSameRequest =
          existing.length === 1 &&
          previous.walletId === wallet.id &&
          previous.category === TTransactionCategory.DEPOSIT &&
          MoneyUtility.isEqual(previous.amount, params.amount);

        if (!isSameRequest) throw duplicateReferenceError();

        return {
          isReplayed: true,
          wallet: formatWallet(wallet),
          transaction: previous,
        };
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = MoneyUtility.add(balanceBefore, params.amount);

      await manager.update(Wallet, wallet.id, { balance: balanceAfter });
      wallet.balance = balanceAfter;

      const transaction = await manager.save(
        manager.create(WalletTransaction, {
          walletId: wallet.id,
          referenceId: params.referenceId,
          type: TTransactionType.CREDIT,
          category: TTransactionCategory.DEPOSIT,
          amount: params.amount,
          balanceBefore,
          balanceAfter,
          description: params.description || "Wallet deposit",
        })
      );

      return {
        isReplayed: false,
        wallet: formatWallet(wallet),
        transaction,
      };
    })
  );
};

const transfer = async (userId: number, params: TTransfer) => {
  if (userId === params.toUserId) {
    throw new StringError("You cannot transfer money to yourself");
  }

  const senderWallet = await getActiveWallet(userId);
  const receiverWallet = await findActiveWallet(params.toUserId);
  if (!receiverWallet) {
    throw new StringError(
      "Receiver does not have an active wallet",
      httpStatusCodes.NOT_FOUND
    );
  }

  if (senderWallet.currency !== receiverWallet.currency) {
    throw new StringError(
      `Currency mismatch: ${senderWallet.currency} to ${receiverWallet.currency} transfers are not supported`
    );
  }

  return withReferenceGuard(() =>
    AppDataSource.transaction(async (manager) => {
      const lockedWallets = await lockWallets(manager, [
        senderWallet.id,
        receiverWallet.id,
      ]);
      const sender = ensureActive(
        lockedWallets.find((wallet) => wallet.id === senderWallet.id),
        "Sender wallet is not active"
      );
      const receiver = ensureActive(
        lockedWallets.find((wallet) => wallet.id === receiverWallet.id),
        "Receiver wallet is not active"
      );

      const existing = await findByReference(manager, params.referenceId);
      if (existing.length) {
        const debit = existing.find(
          (txn) => txn.type === TTransactionType.DEBIT
        );
        const credit = existing.find(
          (txn) => txn.type === TTransactionType.CREDIT
        );
        const isSameRequest =
          debit &&
          credit &&
          debit.category === TTransactionCategory.TRANSFER &&
          debit.walletId === sender.id &&
          credit.walletId === receiver.id &&
          MoneyUtility.isEqual(debit.amount, params.amount);

        if (!isSameRequest) throw duplicateReferenceError();

        return {
          isReplayed: true,
          referenceId: params.referenceId,
          amount: debit.amount,
          wallet: formatWallet(sender),
          debit,
          credit,
        };
      }

      if (!MoneyUtility.hasSufficientBalance(sender.balance, params.amount)) {
        throw new StringError(
          "Insufficient wallet balance",
          httpStatusCodes.UNPROCESSABLE_ENTITY
        );
      }

      const senderBalanceAfter = MoneyUtility.subtract(
        sender.balance,
        params.amount
      );
      const receiverBalanceAfter = MoneyUtility.add(
        receiver.balance,
        params.amount
      );

      await manager.update(Wallet, sender.id, { balance: senderBalanceAfter });
      await manager.update(Wallet, receiver.id, {
        balance: receiverBalanceAfter,
      });

      const [debit, credit] = await manager.save(WalletTransaction, [
        manager.create(WalletTransaction, {
          walletId: sender.id,
          relatedWalletId: receiver.id,
          referenceId: params.referenceId,
          type: TTransactionType.DEBIT,
          category: TTransactionCategory.TRANSFER,
          amount: params.amount,
          balanceBefore: sender.balance,
          balanceAfter: senderBalanceAfter,
          description: params.description || `Transfer to user ${receiver.userId}`,
        }),
        manager.create(WalletTransaction, {
          walletId: receiver.id,
          relatedWalletId: sender.id,
          referenceId: params.referenceId,
          type: TTransactionType.CREDIT,
          category: TTransactionCategory.TRANSFER,
          amount: params.amount,
          balanceBefore: receiver.balance,
          balanceAfter: receiverBalanceAfter,
          description: params.description || `Transfer from user ${sender.userId}`,
        }),
      ]);

      sender.balance = senderBalanceAfter;

      return {
        isReplayed: false,
        referenceId: params.referenceId,
        amount: params.amount,
        wallet: formatWallet(sender),
        debit,
        credit,
      };
    })
  );
};

const getBalance = async (userId: number) => {
  const wallet = await getActiveWallet(userId);
  return formatWallet(wallet);
};

const listTransactions = async (userId: number, params: TTransactionFilter) => {
  const wallet = await getActiveWallet(userId);

  const query = WalletTransactionRepository.createQueryBuilder("txn").where(
    "txn.walletId = :walletId",
    { walletId: wallet.id }
  );

  if (params.type === TTransactionFilterType.TRANSFER) {
    query.andWhere("txn.category = :category", {
      category: TTransactionCategory.TRANSFER,
    });
  } else if (params.type) {
    query.andWhere("txn.type = :type", { type: params.type });
  }

  if (params.fromDate) {
    query.andWhere("txn.createdAt >= :fromDate", { fromDate: params.fromDate });
  }

  if (params.toDate) {
    query.andWhere("txn.createdAt <= :toDate", {
      toDate: toEndOfDay(params.toDate),
    });
  }

  const [transactions, total] = await query
    .orderBy("txn.createdAt", "DESC")
    .addOrderBy("txn.id", "DESC")
    .skip(ApiUtility.getOffset(params.limit, params.page))
    .take(params.limit)
    .getManyAndCount();

  const { pagination } = ApiUtility.getPagination(
    total,
    params.limit,
    params.page
  );

  return { transactions, pagination };
};

const getSummary = async (userId: number) => {
  const wallet = await getActiveWallet(userId);

  const totals = await WalletTransactionRepository.createQueryBuilder("txn")
    .select(
      "COALESCE(SUM(CASE WHEN txn.type = :credit THEN txn.amount ELSE 0 END), 0)",
      "totalCredited"
    )
    .addSelect(
      "COALESCE(SUM(CASE WHEN txn.type = :debit THEN txn.amount ELSE 0 END), 0)",
      "totalDebited"
    )
    .addSelect(
      "COALESCE(SUM(CASE WHEN txn.type = :debit AND txn.category = :transfer THEN txn.amount ELSE 0 END), 0)",
      "totalTransferred"
    )
    .addSelect("COUNT(txn.id)", "totalTransactions")
    .where("txn.walletId = :walletId", { walletId: wallet.id })
    .setParameters({
      credit: TTransactionType.CREDIT,
      debit: TTransactionType.DEBIT,
      transfer: TTransactionCategory.TRANSFER,
    })
    .getRawOne();

  return {
    walletId: wallet.id,
    currency: wallet.currency,
    currentBalance: wallet.balance,
    totalCredited: Number(totals.totalCredited),
    totalDebited: Number(totals.totalDebited),
    totalTransferred: Number(totals.totalTransferred),
    totalTransactions: Number(totals.totalTransactions),
  };
};

export default {
  createWallet,
  deposit,
  transfer,
  getBalance,
  listTransactions,
  getSummary,
};
