import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateWalletTransactions1792141800000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "wallet_transactions",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "wallet_id",
            type: "int",
          },
          {
            name: "reference_id",
            type: "varchar",
            length: "64",
          },
          {
            name: "type",
            type: "enum",
            enum: ["CREDIT", "DEBIT"],
          },
          {
            name: "category",
            type: "enum",
            enum: ["DEPOSIT", "TRANSFER"],
          },
          {
            name: "amount",
            type: "decimal",
            precision: 18,
            scale: 2,
          },
          {
            name: "balance_before",
            type: "decimal",
            precision: 18,
            scale: 2,
          },
          {
            name: "balance_after",
            type: "decimal",
            precision: 18,
            scale: 2,
          },
          {
            name: "related_wallet_id",
            type: "int",
            isNullable: true,
          },
          {
            name: "description",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "datetime",
            precision: 6,
            default: "CURRENT_TIMESTAMP(6)",
          },
        ],
        indices: [
          new TableIndex({
            name: "uq_wallet_transactions_reference_type",
            columnNames: ["reference_id", "type"],
            isUnique: true,
          }),
          new TableIndex({
            name: "idx_wallet_transactions_wallet_created",
            columnNames: ["wallet_id", "createdAt"],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "fk_wallet_transactions_wallet_id",
            columnNames: ["wallet_id"],
            referencedTableName: "wallets",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
          new TableForeignKey({
            name: "fk_wallet_transactions_related_wallet_id",
            columnNames: ["related_wallet_id"],
            referencedTableName: "wallets",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("wallet_transactions");
  }
}
