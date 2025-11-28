import { createDatabaseConfig, type DatabaseConfig } from "../../src/config";

// Database configurations mapping
export const databaseConfigs: Record<string, DatabaseConfig> = {
  "db-main": createDatabaseConfig("DB_MAIN"),
  "db-logs": createDatabaseConfig("DB_LOGS"),
};

// Helper function to get database config by name
export function getDatabaseConfig(name: string): DatabaseConfig {
  const config = databaseConfigs[name];
  if (!config) {
    throw new Error(`Database configuration not found for: ${name}`);
  }
  return config;
}

// Get all available database names
export function getAvailableDatabases(): string[] {
  return Object.keys(databaseConfigs);
}

export * from "../../src/config";
