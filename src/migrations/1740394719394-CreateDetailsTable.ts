import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateDetailsTable1740394719394 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("details");

    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: "details",
          columns: [
            {
              name: "id",
              type: "serial",
              isPrimary: true,
            },
            {
              name: "order_id",
              type: "integer",
              isNullable: false,
            },
            {
              name: "service_id",
              type: "integer",
              isNullable: false,
            },
            {
              name: "quantity",
              type: "integer",
              isNullable: false,
            },
          ],
        }),
      );

      await queryRunner.createForeignKey(
        "details",
        new TableForeignKey({
          columnNames: ["order_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "orders",
          onDelete: "CASCADE",
        }),
      );

      await queryRunner.createForeignKey(
        "details",
        new TableForeignKey({
          columnNames: ["service_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "services",
          onDelete: "CASCADE",
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("details");
    if (!table) {
      return;
    }

    const foreignKeyOrder = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("order_id") !== -1,
    );
    const foreignKeyService = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("service_id") !== -1,
    );

    if (foreignKeyOrder)
      await queryRunner.dropForeignKey("details", foreignKeyOrder);
    if (foreignKeyService)
      await queryRunner.dropForeignKey("details", foreignKeyService);

    await queryRunner.dropTable("details");
  }
}
