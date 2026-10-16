import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import {
  TTransactionCategory,
  TTransactionType,
} from "../../types/wallet.type";
import { ColumnNumericTransformer } from "../../utilities/common.utility";
import { Wallet } from "./wallet.entity";

const numericTransformer = new ColumnNumericTransformer();

@Entity("wallet_transactions")
export class WalletTransaction {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ name: "wallet_id", type: "int" })
  walletId: number;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: "wallet_id" })
  wallet: Wallet;

  @Column({ name: "reference_id", length: 64 })
  referenceId: string;

  @Column({ type: "enum", enum: TTransactionType })
  type: TTransactionType;

  @Column({ type: "enum", enum: TTransactionCategory })
  category: TTransactionCategory;

  @Column({
    type: "decimal",
    precision: 18,
    scale: 2,
    transformer: numericTransformer,
  })
  amount: number;

  @Column({
    name: "balance_before",
    type: "decimal",
    precision: 18,
    scale: 2,
    transformer: numericTransformer,
  })
  balanceBefore: number;

  @Column({
    name: "balance_after",
    type: "decimal",
    precision: 18,
    scale: 2,
    transformer: numericTransformer,
  })
  balanceAfter: number;

  @Column({ name: "related_wallet_id", type: "int", nullable: true })
  relatedWalletId: number | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
