import { DatabaseManager, PostgreSQLDriver } from '@repo/database';
import type { PostgreSQLConfig } from '@repo/database';
import { loadEnv } from '@repo/environment';

loadEnv();

const dbMainConfig: PostgreSQLConfig = {
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

const dbLogsConfig: PostgreSQLConfig = {
  type: 'postgresql',
  host: process.env.DB_LOGS_HOST,
  port: Number(process.env.DB_LOGS_PORT),
  database: process.env.DB_LOGS_NAME,
  user: process.env.DB_LOGS_USER,
  password: process.env.DB_LOGS_PASSWORD,
  ssl: process.env.DB_LOGS_SSL === 'true',
  max: 10,
  min: 2,
};

const mainDriver = DatabaseManager.create(
  'notification-service-main',
  dbMainConfig
) as PostgreSQLDriver;

const logsDriver = DatabaseManager.create(
  'notification-service-logs',
  dbLogsConfig
) as PostgreSQLDriver;

export const dbMain = mainDriver.getClient();
export const dbLogs = logsDriver.getClient();
export const dbMainDriver = mainDriver;
export const dbLogsDriver = logsDriver;

export async function closeDatabases() {
  await DatabaseManager.close('notification-service-main');
  await DatabaseManager.close('notification-service-logs');
}
