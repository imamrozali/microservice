"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeederRunner = void 0;
class SeederRunner {
    dbMain;
    dbLogs;
    constructor(dbMain, dbLogs) {
        this.dbMain = dbMain;
        this.dbLogs = dbLogs;
    }
    async ensureSeederTable() {
        await this.dbMain.schema
            .createTable("seeders")
            .ifNotExists()
            .addColumn("id", "serial", (col) => col.primaryKey())
            .addColumn("name", "varchar(255)", (col) => col.notNull().unique())
            .addColumn("executed_at", "timestamp", (col) => col.defaultTo(this.dbMain.fn("now")).notNull())
            .execute();
    }
    async getExecutedSeeders() {
        await this.ensureSeederTable();
        const result = await this.dbMain
            .selectFrom("seeders")
            .select("name")
            .orderBy("executed_at", "asc")
            .execute();
        return result.map((row) => row.name);
    }
    async executeSeeder(seeder) {
        await seeder.run(this.dbMain, this.dbLogs);
        await this.dbMain
            .insertInto("seeders")
            .values({ name: seeder.name })
            .execute();
        console.log(`✓ Executed seeder: ${seeder.name}`);
    }
    async runSeeders(seeders) {
        const executed = await this.getExecutedSeeders();
        const pending = seeders.filter((s) => !executed.includes(s.name));
        if (pending.length === 0) {
            console.log("No pending seeders");
            return;
        }
        console.log(`Running ${pending.length} pending seeders...`);
        for (const seeder of pending) {
            await this.executeSeeder(seeder);
        }
        console.log("All seeders completed successfully");
    }
}
exports.SeederRunner = SeederRunner;
