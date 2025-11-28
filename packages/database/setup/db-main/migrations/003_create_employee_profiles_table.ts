import { Kysely, sql } from "kysely";
import { Migration } from "../../../src/migrations";

export const createEmployeeProfilesTable: Migration = {
  name: "003_create_employee_profiles_table",
  up: async (db: Kysely<any>) => {
    await db.schema
      .createTable("employee_profiles")
      .addColumn("id", "uuid", (col) =>
        col.primaryKey().defaultTo(sql`gen_random_uuid()`)
      )
      .addColumn("user_id", "uuid", (col) =>
        col.notNull().unique().references("users.id").onDelete("cascade")
      )
      .addColumn("full_name", "varchar(255)", (col) => col.notNull())
      .addColumn("photo_url", "text", (col) => col.defaultTo(null))
      .addColumn("position", "varchar(100)", (col) => col.notNull())
      .addColumn("phone_number", "varchar(20)", (col) => col.notNull())
      .addColumn("employee_number", "varchar(50)", (col) =>
        col.notNull().unique()
      )
      .addColumn("date_joined", "date", (col) => col.notNull())
      .addColumn("created_at", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .addColumn("updated_at", "timestamp", (col) => col.defaultTo(null))
      .execute();

    // Create indexes
    await db.schema
      .createIndex("idx_employee_profiles_user_id")
      .on("employee_profiles")
      .column("user_id")
      .execute();

    await db.schema
      .createIndex("idx_employee_profiles_employee_number")
      .on("employee_profiles")
      .column("employee_number")
      .execute();

    await db.schema
      .createIndex("idx_employee_profiles_full_name")
      .on("employee_profiles")
      .column("full_name")
      .execute();
  },
  down: async (db: Kysely<any>) => {
    await db.schema.dropTable("employee_profiles").execute();
  },
};
