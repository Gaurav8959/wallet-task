import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateWallets1792141500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "wallets",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "user_id",
            type: "int",
          },
          {
            name: "balance",
            type: "decimal",
            precision: 18,
            scale: 2,
            default: 0,
          },
          {
            name: "currency",
            type: "varchar",
            length: "3",
            default: "'INR'",
          },
          {
            name: "status",
            type: "enum",
            enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
            default: "'ACTIVE'",
          },
          {
            name: "createdAt",
            type: "datetime",
            precision: 6,
            default: "CURRENT_TIMESTAMP(6)",
          },
          {
            name: "updatedAt",
            type: "datetime",
            precision: 6,
            default: "CURRENT_TIMESTAMP(6)",
            onUpdate: "CURRENT_TIMESTAMP(6)",
          },
        ],
        indices: [
          new TableIndex({
            name: "idx_wallets_user_id",
            columnNames: ["user_id"],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "fk_wallets_user_id",
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
        ],
      }),
      true
    );

    await queryRunner.query(
      "ALTER TABLE `wallets` " +
        "ADD COLUMN `active_user_id` INT GENERATED ALWAYS AS (IF(`status` = 'ACTIVE', `user_id`, NULL)) STORED, " +
        "ADD UNIQUE INDEX `uq_wallets_active_user_id` (`active_user_id`), " +
        "ADD CONSTRAINT `chk_wallets_balance` CHECK (`balance` >= 0)"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("wallets");
  }
}
