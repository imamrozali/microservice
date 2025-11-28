#!/usr/bin/env tsx

import { getDatabaseMain, getDatabaseLogs } from "./database";
import { MigrationRunner } from "./migrations";
import { dbMainMigrations } from "../setup/db-main/migrations";
import { dbLogsMigrations } from "../setup/db-logs/migrations";

async function runMigrations() {
  console.log("Running database migrations...\n");

  try {
    // Run main database migrations
    console.log("Running db-main migrations...");
    const dbMain = getDatabaseMain();
    const mainRunner = new MigrationRunner(dbMain);
    await mainRunner.runMigrations(dbMainMigrations);
    console.log("db-main migrations completed\n");

    // Run logs database migrations
    console.log("Running db-logs migrations...");
    const dbLogs = getDatabaseLogs();
    const logsRunner = new MigrationRunner(dbLogs);
    await logsRunner.runMigrations(dbLogsMigrations);
    console.log("db-logs migrations completed\n");

    console.log("All migrations completed successfully!");
  } catch (error) {
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
} else {
  runMigrations();
}
