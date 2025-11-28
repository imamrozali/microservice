import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from the root .env file
// Use process.cwd() to find the workspace root when running from the packages/database directory
config({ path: resolve(process.cwd(), "../../.env") });

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export function createDatabaseConfig(prefix: string): DatabaseConfig {
  const host = process.env[`${prefix}_HOST`] || "localhost";
  const port = parseInt(process.env[`${prefix}_PORT`] || "5432", 10);
  const database = process.env[`${prefix}_NAME`];
  const user = process.env[`${prefix}_USER`];
  const password = process.env[`${prefix}_PASSWORD`];

  if (!database || !user || !password) {
    throw new Error(`Missing required database configuration for ${prefix}`);
  }

  return {
    host,
    port,
    database,
    user,
    password,
    ssl: process.env.NODE_ENV === "production",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

// Pre-configured database configs
export const dbMainConfig = createDatabaseConfig("DB_MAIN");
export const dbLogsConfig = createDatabaseConfig("DB_LOGS");
