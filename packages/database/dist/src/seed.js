#!/usr/bin/env tsx
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database");
const seeder_1 = require("../setup/seeder");
const all_1 = require("../setup/seeder/all");
async function runSeeders() {
    console.log("Running database seeders...\n");
    try {
        const dbMain = (0, database_1.getDatabaseMain)();
        const dbLogs = (0, database_1.getDatabaseLogs)();
        const runner = new seeder_1.SeederRunner(dbMain, dbLogs);
        await runner.runSeeders(all_1.allSeeders);
        console.log("\n All seeders completed successfully!");
    }
    catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}
runSeeders();
