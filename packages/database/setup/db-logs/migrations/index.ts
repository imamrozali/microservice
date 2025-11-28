import { Migration } from "../../../src/migrations";

// Import all migrations
import { createAuditLogsTable } from "./001_create_audit_logs_table";

// Export all migrations in order
export const dbLogsMigrations: Migration[] = [createAuditLogsTable];

// Export individual migrations for convenience
export * from "./001_create_audit_logs_table";
