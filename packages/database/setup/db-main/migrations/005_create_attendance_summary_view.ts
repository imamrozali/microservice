import { Kysely, sql } from "kysely";
import { Migration } from "../../../src/migrations";

export const createAttendanceSummaryView: Migration = {
  name: "005_create_attendance_summary_view",
  up: async (db: Kysely<any>) => {
    await sql`
      CREATE VIEW attendance_summary AS
      SELECT 
        user_id,
        event_date,
        MIN(CASE WHEN event_type = 'IN' THEN event_time END) AS time_in,
        MAX(CASE WHEN event_type = 'OUT' THEN event_time END) AS time_out
      FROM attendance_events
      GROUP BY user_id, event_date
      ORDER BY user_id, event_date DESC
    `.execute(db);
  },
  down: async (db: Kysely<any>) => {
    await sql`DROP VIEW IF EXISTS attendance_summary`.execute(db);
  },
};
