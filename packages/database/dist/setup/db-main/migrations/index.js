"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbMainMigrations = void 0;
// Import all migrations
const _001_create_roles_table_1 = require("./001_create_roles_table");
const _002_create_users_table_1 = require("./002_create_users_table");
const _003_create_employee_profiles_table_1 = require("./003_create_employee_profiles_table");
const _004_create_attendance_events_table_1 = require("./004_create_attendance_events_table");
const _005_create_attendance_summary_view_1 = require("./005_create_attendance_summary_view");
// Export all migrations in order
exports.dbMainMigrations = [
    _001_create_roles_table_1.createRolesTable,
    _002_create_users_table_1.createUsersTable,
    _003_create_employee_profiles_table_1.createEmployeeProfilesTable,
    _004_create_attendance_events_table_1.createAttendanceEventsTable,
    _005_create_attendance_summary_view_1.createAttendanceSummaryView,
];
// Export individual migrations for convenience
__exportStar(require("./001_create_roles_table"), exports);
__exportStar(require("./002_create_users_table"), exports);
__exportStar(require("./003_create_employee_profiles_table"), exports);
__exportStar(require("./004_create_attendance_events_table"), exports);
__exportStar(require("./005_create_attendance_summary_view"), exports);
