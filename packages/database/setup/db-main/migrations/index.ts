import { Migration } from "../../../src/migrations";

// Import all migrations
import { createRolesTable } from "./001_create_roles_table";
import { createUsersTable } from "./002_create_users_table";
import { createEmployeeProfilesTable } from "./003_create_employee_profiles_table";
import { createAttendanceEventsTable } from "./004_create_attendance_events_table";
import { createAttendanceSummaryView } from "./005_create_attendance_summary_view";

// Export all migrations in order
export const dbMainMigrations: Migration[] = [
  createRolesTable,
  createUsersTable,
  createEmployeeProfilesTable,
  createAttendanceEventsTable,
  createAttendanceSummaryView,
];

// Export individual migrations for convenience
export * from "./001_create_roles_table";
export * from "./002_create_users_table";
export * from "./003_create_employee_profiles_table";
export * from "./004_create_attendance_events_table";
export * from "./005_create_attendance_summary_view";
