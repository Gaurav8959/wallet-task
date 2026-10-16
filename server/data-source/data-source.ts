import "dotenv/config";
import "reflect-metadata";
import path from "path";
import { DataSource } from "typeorm";
import { User } from "../entities/usermgmt/user.entity";
import { WalletTransaction } from "../entities/wallet/wallet-transaction.entity";
import { Wallet } from "../entities/wallet/wallet.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  synchronize: false,
  logging: false,
  entities: [User, Wallet, WalletTransaction],
  migrations: [path.join(__dirname, "../migrations/*.{ts,js}")],
  migrationsTableName: "migrations",
  timezone: "Z",
  extra: {
    connectionLimit: 25,
  },
});
