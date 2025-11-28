import { Kysely, sql } from "kysely";
import { Migration } from "../../../src/migrations";

export const createAuditLogsTable: Migration = {
  name: "001_create_audit_logs_table",
  up: async (db: Kysely<any>) => {
    // Create ENUM type for event_type
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_event_type') THEN
          CREATE TYPE audit_event_type AS ENUM ('INSERT', 'UPDATE', 'DELETE');
        END IF;
      END$$;
    `.execute(db);

    await db.schema
      .createTable("audit_logs")
      .addColumn("id", "bigserial", (col) => col.primaryKey())
      .addColumn("app", "varchar(100)", (col) => col.notNull())
      .addColumn("service_name", "varchar(100)", (col) => col.notNull())
      .addColumn("event_type", sql`audit_event_type`, (col) => col.notNull())
      .addColumn("payload", "jsonb", (col) => col.notNull())
      .addColumn("target_user_id", "uuid", (col) => col.defaultTo(null))
      .addColumn("is_read", "boolean", (col) => col.defaultTo(false).notNull())
      .addColumn("created_at", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .addColumn("processed_at", "timestamp", (col) => col.defaultTo(null))
      .addColumn("processed_by", "varchar(255)", (col) => col.defaultTo(null))
      .execute();

    // Create indexes for performance
    await db.schema
      .createIndex("idx_audit_logs_app")
      .on("audit_logs")
      .column("app")
      .execute();

    await db.schema
      .createIndex("idx_audit_logs_service_name")
      .on("audit_logs")
      .column("service_name")
      .execute();

    await db.schema
      .createIndex("idx_audit_logs_event_type")
      .on("audit_logs")
      .column("event_type")
      .execute();

    await db.schema
      .createIndex("idx_audit_logs_target_user_id")
      .on("audit_logs")
      .column("target_user_id")
      .execute();

    await db.schema
      .createIndex("idx_audit_logs_is_read")
      .on("audit_logs")
      .column("is_read")
      .execute();

    await db.schema
      .createIndex("idx_audit_logs_created_at")
      .on("audit_logs")
      .column("created_at")
      .execute();

    // GIN index for JSONB payload
    await sql`
      CREATE INDEX idx_audit_logs_payload_gin 
      ON audit_logs USING GIN (payload)
    `.execute(db);
  },
  down: async (db: Kysely<any>) => {
    await db.schema.dropTable("audit_logs").execute();
    await sql`DROP TYPE IF EXISTS audit_event_type`.execute(db);
  },
};
