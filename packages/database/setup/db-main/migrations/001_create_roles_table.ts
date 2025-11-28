import { Kysely, sql } from "kysely";
import { Migration } from "../../../src/migrations";

export const createRolesTable: Migration = {
  name: "001_create_roles_table",
  up: async (db: Kysely<any>) => {
    await db.schema
      .createTable("roles")
      .addColumn("id", "uuid", (col) =>
        col.primaryKey().defaultTo(sql`gen_random_uuid()`)
      )
      .addColumn("code", "varchar(50)", (col) => col.notNull().unique())
      .addColumn("name", "varchar(100)", (col) => col.notNull())
      .addColumn("created_at", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .execute();

    // Create indexes
    await db.schema
      .createIndex("idx_roles_code")
      .on("roles")
      .column("code")
      .execute();
  },
  down: async (db: Kysely<any>) => {
    await db.schema.dropTable("roles").execute();
  },
};
