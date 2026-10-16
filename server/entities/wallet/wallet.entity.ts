import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { TCurrency, TWalletStatus } from "../../types/wallet.type";
import { ColumnNumericTransformer } from "../../utilities/common.utility";
import { PrimaryAuditEntity } from "../base/primaryaudit.entity";
import { User } from "../usermgmt/user.entity";

@Entity("wallets")
export class Wallet extends PrimaryAuditEntity {
  @Column({ name: "user_id", type: "int" })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({
    type: "decimal",
    precision: 18,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  balance: number;

  @Column({ type: "varchar", length: 3, default: TCurrency.INR })
  currency: TCurrency;

  @Column({ type: "enum", enum: TWalletStatus, default: TWalletStatus.ACTIVE })
  status: TWalletStatus;
}
