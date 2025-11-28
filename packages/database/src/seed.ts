#!/usr/bin/env tsx

import { getDatabaseMain, getDatabaseLogs } from "./database";
import { SeederRunner } from "../setup/seeder";
import { allSeeders } from "../setup/seeder/all";

async function runSeeders() {
  console.log("Running database seeders...\n");

  try {
    const dbMain = getDatabaseMain();
    const dbLogs = getDatabaseLogs();

    const runner = new SeederRunner(dbMain, dbLogs);
    await runner.runSeeders(allSeeders);

    console.log("\n All seeders completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

runSeeders();
