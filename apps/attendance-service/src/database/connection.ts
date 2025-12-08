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

const driver = DatabaseManager.create(
  'attendance-service',
  dbConfig
) as PostgreSQLDriver;

export const db = driver.getClient();
export const dbDriver = driver;

export async function closeDatabase() {
  await DatabaseManager.close('attendance-service');
}
