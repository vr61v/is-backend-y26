import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1740394719390 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("users");

    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: "users",
          columns: [
            {
              name: "id",
              type: "serial",
              isPrimary: true,
            },
            {
              name: "full_name",
              type: "varchar",
              length: "255",
              isNullable: false,
            },
            {
              name: "supertokens_id",
              type: "varchar",
              length: "255",
              isNullable: false,
            },
            {
              name: "email",
              type: "varchar",
              length: "255",
              isUnique: true,
              isNullable: false,
            },
            {
              name: "password",
              type: "varchar",
              length: "255",
              isNullable: false,
            },
            {
              name: "status",
              type: "enum",
              enum: ["active", "suspended", "blocked"],
              default: "'active'",
            },
            {
              name: "created_at",
              type: "timestamp",
              default: "CURRENT_TIMESTAMP",
            },
          ],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
  }
}
