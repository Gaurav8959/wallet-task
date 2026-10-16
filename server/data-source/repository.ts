import { User } from "../entities/usermgmt/user.entity";
import { WalletTransaction } from "../entities/wallet/wallet-transaction.entity";
import { Wallet } from "../entities/wallet/wallet.entity";
import { AppDataSource } from "./data-source";

export const UserRepository = AppDataSource.getRepository(User);
export const WalletRepository = AppDataSource.getRepository(Wallet);
export const WalletTransactionRepository =
  AppDataSource.getRepository(WalletTransaction);
