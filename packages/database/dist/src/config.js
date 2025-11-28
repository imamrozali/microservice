"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbLogsConfig = exports.dbMainConfig = void 0;
exports.createDatabaseConfig = createDatabaseConfig;
const dotenv_1 = require("dotenv");
const path_1 = require("path");
// Load environment variables from the root .env file
// Use process.cwd() to find the workspace root when running from the packages/database directory
(0, dotenv_1.config)({ path: (0, path_1.resolve)(process.cwd(), "../../.env") });
function createDatabaseConfig(prefix) {
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
exports.dbMainConfig = createDatabaseConfig("DB_MAIN");
exports.dbLogsConfig = createDatabaseConfig("DB_LOGS");
