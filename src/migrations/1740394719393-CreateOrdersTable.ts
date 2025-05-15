import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateOrdersTable1740394719393 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("orders");

    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: "orders",
          columns: [
            {
              name: "id",
              type: "serial",
              isPrimary: true,
            },
            {
              name: "user_id",
              type: "integer",
              isNullable: false,
            },
            {
              name: "created_at",
              type: "timestamp",
              default: "CURRENT_TIMESTAMP",
            },
            {
              name: "status",
              type: "enum",
              enum: ["pending", "in_execute", "completed", "canceled"],
              default: "'pending'",
            },
            {
              name: "total_price",
              type: "decimal",
              default: "0.00",
              isNullable: false,
            },
          ],
        }),
      );

      await queryRunner.createForeignKey(
        "orders",
        new TableForeignKey({
          columnNames: ["user_id"],
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const ordersTable = await queryRunner.getTable("orders");
    const foreignKey = ordersTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("user_id") !== -1,
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey("orders", foreignKey);
    }
    await queryRunner.dropTable("orders");
  }
}
