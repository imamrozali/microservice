import { Kysely, sql } from "kysely";
import { Migration } from "../../../src/migrations";

export const createUsersTable: Migration = {
  name: "002_create_users_table",
  up: async (db: Kysely<any>) => {
    await db.schema
      .createTable("users")
      .addColumn("id", "uuid", (col) =>
        col.primaryKey().defaultTo(sql`gen_random_uuid()`)
      )
      .addColumn("email", "varchar(255)", (col) => col.notNull().unique())
      .addColumn("password_hash", "varchar(255)", (col) => col.notNull())
      .addColumn("role_id", "uuid", (col) =>
        col.notNull().references("roles.id").onDelete("restrict")
      )
      .addColumn("is_active", "boolean", (col) => col.defaultTo(true).notNull())
      .addColumn("created_at", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .addColumn("updated_at", "timestamp", (col) => col.defaultTo(null))
      .execute();

    // Create indexes
    await db.schema
      .createIndex("idx_users_email")
      .on("users")
      .column("email")
      .execute();

    await db.schema
      .createIndex("idx_users_role_id")
      .on("users")
      .column("role_id")
      .execute();

    await db.schema
      .createIndex("idx_users_is_active")
      .on("users")
      .column("is_active")
      .execute();
  },
  down: async (db: Kysely<any>) => {
    await db.schema.dropTable("users").execute();
  },
};
