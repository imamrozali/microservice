// Main exports
export * from "./database";
export * from "./types";
export * from "./config";
export * from "./migrations";
export * from "./nestjs-module";
// Database instances
export { getDatabase, getDatabaseMain, getDatabaseLogs } from "./database";

// Types
export type { Database, DatabaseMain, DatabaseLogs } from "./types";

// Configuration
export { createDatabaseConfig, type DatabaseConfig } from "./config";
