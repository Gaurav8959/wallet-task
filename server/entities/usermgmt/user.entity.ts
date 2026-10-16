import { Column, Entity } from "typeorm";
import { PrimaryAuditEntity } from "../base/primaryaudit.entity";

@Entity("users")
export class User extends PrimaryAuditEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ length: 100, select: false })
  password: string;
}
