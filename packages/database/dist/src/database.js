"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseMain = getDatabaseMain;
exports.getDatabaseLogs = getDatabaseLogs;
exports.getDatabase = getDatabase;
exports.closeDatabases = closeDatabases;
const kysely_1 = require("kysely");
const pg_1 = require("pg");
const config_1 = require("./config");
// Database connection pools
const pools = {};
function createPool(config) {
    const poolKey = `${config.host}:${config.port}:${config.database}`;
    if (!pools[poolKey]) {
        pools[poolKey] = new pg_1.Pool({
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
function createDatabase(config) {
    const pool = createPool(config);
    return new kysely_1.Kysely({
        dialect: new kysely_1.PostgresDialect({
            pool,
        }),
    });
}
// Singleton database instances
let dbMainInstance = null;
let dbLogsInstance = null;
function getDatabaseMain() {
    if (!dbMainInstance) {
        dbMainInstance = createDatabase(config_1.dbMainConfig);
    }
    return dbMainInstance;
}
function getDatabaseLogs() {
    if (!dbLogsInstance) {
        dbLogsInstance = createDatabase(config_1.dbLogsConfig);
    }
    return dbLogsInstance;
}
function getDatabase(databaseName) {
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
async function closeDatabases() {
    const promises = [];
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
