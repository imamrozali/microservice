"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAttendanceSummaryView = void 0;
const kysely_1 = require("kysely");
exports.createAttendanceSummaryView = {
    name: "005_create_attendance_summary_view",
    up: async (db) => {
        await (0, kysely_1.sql) `
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
    down: async (db) => {
        await (0, kysely_1.sql) `DROP VIEW IF EXISTS attendance_summary`.execute(db);
    },
};
