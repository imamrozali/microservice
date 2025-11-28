import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { DatabaseMain, DatabaseLogs, Database } from "./types";
import { dbMainConfig, dbLogsConfig, type DatabaseConfig } from "./config";

// Database connection pools
const pools: Record<string, Pool> = {};

function createPool(config: DatabaseConfig): Pool {
  const poolKey = `${config.host}:${config.port}:${config.database}`;

  if (!pools[poolKey]) {
    pools[poolKey] = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl,
      max: config.max,
      idleTimeoutMillis: config.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionTimeoutMillis,
    });
  }

  return pools[poolKey];
}

function createDatabase<T>(config: DatabaseConfig): Kysely<T> {
  const pool = createPool(config);

  return new Kysely<T>({
    dialect: new PostgresDialect({
      pool,
    }),
  });
}

// Singleton database instances
let dbMainInstance: Kysely<DatabaseMain> | null = null;
let dbLogsInstance: Kysely<DatabaseLogs> | null = null;

export function getDatabaseMain(): Kysely<DatabaseMain> {
  if (!dbMainInstance) {
    dbMainInstance = createDatabase<DatabaseMain>(dbMainConfig);
  }
  return dbMainInstance;
}

export function getDatabaseLogs(): Kysely<DatabaseLogs> {
  if (!dbLogsInstance) {
    dbLogsInstance = createDatabase<DatabaseLogs>(dbLogsConfig);
  }
  return dbLogsInstance;
}

// Generic database getter
export function getDatabase(databaseName: "main"): Kysely<DatabaseMain>;
export function getDatabase(databaseName: "logs"): Kysely<DatabaseLogs>;
export function getDatabase(
  databaseName: "main" | "logs"
): Kysely<DatabaseMain> | Kysely<DatabaseLogs> {
  switch (databaseName) {
    case "main":
      return getDatabaseMain();
    case "logs":
      return getDatabaseLogs();
    default:
      throw new Error(`Unknown database: ${databaseName}`);
  }
}

// Cleanup function
export async function closeDatabases(): Promise<void> {
  const promises: Promise<void>[] = [];

  if (dbMainInstance) {
    promises.push(dbMainInstance.destroy());
    dbMainInstance = null;
  }

  if (dbLogsInstance) {
    promises.push(dbLogsInstance.destroy());
    dbLogsInstance = null;
  }

  // Close all pools
  Object.values(pools).forEach((pool) => {
    promises.push(pool.end());
  });

  await Promise.all(promises);

  // Clear pools
  Object.keys(pools).forEach((key) => {
    delete pools[key];
  });
}
