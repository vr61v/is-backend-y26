import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateServicesTable1740394719391 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("services");

    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: "services",
          columns: [
            {
              name: "id",
              type: "serial",
              isPrimary: true,
            },
            {
              name: "name_value",
              type: "varchar",
              length: "255",
              isUnique: true,
              isNullable: false,
            },
            {
              name: "name",
              type: "varchar",
              length: "255",
              isNullable: false,
            },
            {
              name: "description",
              type: "varchar",
              length: "255",
              isNullable: false,
            },
            {
              name: "price",
              type: "decimal",
              isNullable: false,
            },
            {
              name: "is_rent",
              type: "boolean",
              default: false,
            },
          ],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("services");
  }
}
