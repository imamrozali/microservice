"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const config_1 = require("./config");
async function createDatabaseIfNotExists(config) {
    const { host, port, user, password, database } = config;
    const client = new pg_1.Client({
        host,
        port,
        user,
        password,
        database: "postgres",
    });
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [database]);
    if (res.rowCount === 0) {
        await client.query(`CREATE DATABASE "${database}"`);
        console.log(`✓ Created database: ${database}`);
    }
    else {
        console.log(`Database already exists: ${database}`);
    }
    await client.end();
}
async function main() {
    await createDatabaseIfNotExists(config_1.dbMainConfig);
    await createDatabaseIfNotExists(config_1.dbLogsConfig);
}
main().catch((err) => {
    console.error("Failed to create database:", err);
    process.exit(1);
});
