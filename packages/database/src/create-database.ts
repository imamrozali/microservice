import { Client } from "pg";
import { dbMainConfig, dbLogsConfig } from "./config";

async function createDatabaseIfNotExists(config: typeof dbMainConfig) {
  const { host, port, user, password, database } = config;
  const client = new Client({
    host,
    port,
    user,
    password,
    database: "postgres",
  });

  await client.connect();
  const res = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [database]
  );
  if (res.rowCount === 0) {
    await client.query(`CREATE DATABASE "${database}"`);
    console.log(`✓ Created database: ${database}`);
  } else {
    console.log(`Database already exists: ${database}`);
  }
  await client.end();
}

async function main() {
  await createDatabaseIfNotExists(dbMainConfig);
  await createDatabaseIfNotExists(dbLogsConfig);
}

main().catch((err) => {
  console.error("Failed to create database:", err);
  process.exit(1);
});
