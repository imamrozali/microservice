"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAttendanceEventsTable = void 0;
const kysely_1 = require("kysely");
exports.createAttendanceEventsTable = {
    name: "004_create_attendance_events_table",
    up: async (db) => {
        // Create ENUM type for event_type
        await (0, kysely_1.sql) `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_event_type') THEN
          CREATE TYPE attendance_event_type AS ENUM ('IN', 'OUT');
        END IF;
      END$$;
    `.execute(db);
        await db.schema
            .createTable("attendance_events")
            .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
            .addColumn("user_id", "uuid", (col) => col.notNull().references("users.id").onDelete("cascade"))
            .addColumn("event_type", (0, kysely_1.sql) `attendance_event_type`, (col) => col.notNull())
            .addColumn("event_time", "timestamp", (col) => col.notNull())
            .addColumn("event_date", "date", (col) => col.notNull())
            .addColumn("timezone", "varchar(50)", (col) => col.notNull().defaultTo("UTC"))
            .addColumn("agent", "text", (col) => col.defaultTo(null))
            .addColumn("latitude", "decimal", (col) => col.defaultTo(null))
            .addColumn("longitude", "decimal", (col) => col.defaultTo(null))
            .addColumn("created_at", "timestamp", (col) => col.defaultTo((0, kysely_1.sql) `CURRENT_TIMESTAMP`).notNull())
            .execute();
        // Create indexes
        await db.schema
            .createIndex("idx_attendance_events_user_id")
            .on("attendance_events")
            .column("user_id")
            .execute();
        await db.schema
            .createIndex("idx_attendance_events_event_date")
            .on("attendance_events")
            .column("event_date")
            .execute();
        await db.schema
            .createIndex("idx_attendance_events_user_date")
            .on("attendance_events")
            .columns(["user_id", "event_date"])
            .execute();
        await db.schema
            .createIndex("idx_attendance_events_event_time")
            .on("attendance_events")
            .column("event_time")
            .execute();
    },
    down: async (db) => {
        await db.schema.dropTable("attendance_events").execute();
        await (0, kysely_1.sql) `DROP TYPE IF EXISTS attendance_event_type`.execute(db);
    },
};
