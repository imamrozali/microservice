import { DatabaseManager, PostgreSQLDriver } from '@repo/database';
import type { PostgreSQLConfig } from '@repo/database';
import { loadEnv } from '@repo/environment';

loadEnv();

const dbConfig: PostgreSQLConfig = {
  type: 'postgresql',
  host: process.env.DB_MAIN_HOST,
  port: Number(process.env.DB_MAIN_PORT),
  database: process.env.DB_MAIN_NAME,
  user: process.env.DB_MAIN_USER,
  password: process.env.DB_MAIN_PASSWORD,
  ssl: process.env.DB_MAIN_SSL === 'true',
  max: 10,
  min: 2,
};

// Create database connection
const driver = DatabaseManager.create('auth-service', dbConfig) as PostgreSQLDriver;

// Export the Knex client
export const db = driver.getClient();

// Export driver for testing connection
export const dbDriver = driver;

// Helper function to close connection
export async function closeDatabase() {
  await DatabaseManager.close('auth-service');
}
