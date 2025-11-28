#!/usr/bin/env tsx
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database");
const migrations_1 = require("./migrations");
const migrations_2 = require("../setup/db-main/migrations");
const migrations_3 = require("../setup/db-logs/migrations");
async function runMigrations() {
    console.log("Running database migrations...\n");
    try {
        // Run main database migrations
        console.log("Running db-main migrations...");
        const dbMain = (0, database_1.getDatabaseMain)();
        const mainRunner = new migrations_1.MigrationRunner(dbMain);
        await mainRunner.runMigrations(migrations_2.dbMainMigrations);
        console.log("db-main migrations completed\n");
        // Run logs database migrations
        console.log("Running db-logs migrations...");
        const dbLogs = (0, database_1.getDatabaseLogs)();
        const logsRunner = new migrations_1.MigrationRunner(dbLogs);
        await logsRunner.runMigrations(migrations_3.dbLogsMigrations);
        console.log("db-logs migrations completed\n");
        console.log("All migrations completed successfully!");
    }
    catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}
// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];
if (command === "rollback") {
    console.log("Rollback functionality not implemented yet");
    process.exit(1);
}
else {
    runMigrations();
}
