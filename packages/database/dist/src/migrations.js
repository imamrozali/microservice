"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationRunner = void 0;
const kysely_1 = require("kysely");
class MigrationRunner {
    db;
    constructor(db) {
        this.db = db;
    }
    async ensureMigrationTable() {
        await this.db.schema
            .createTable("migrations")
            .ifNotExists()
            .addColumn("id", "serial", (col) => col.primaryKey())
            .addColumn("name", "varchar(255)", (col) => col.notNull().unique())
            .addColumn("executed_at", "timestamp", (col) => col.defaultTo((0, kysely_1.sql) `CURRENT_TIMESTAMP`).notNull())
            .execute();
    }
    async getExecutedMigrations() {
        await this.ensureMigrationTable();
        const result = await this.db
            .selectFrom("migrations")
            .select("name")
            .orderBy("executed_at", "asc")
            .execute();
        return result.map((row) => row.name);
    }
    async executeMigration(migration) {
        await this.db.transaction().execute(async (trx) => {
            await migration.up(trx);
            await trx
                .insertInto("migrations")
                .values({ name: migration.name })
                .execute();
        });
        console.log(`✓ Executed migration: ${migration.name}`);
    }
    async rollbackMigration(migration) {
        if (!migration.down) {
            throw new Error(`Migration ${migration.name} has no down function`);
        }
        await this.db.transaction().execute(async (trx) => {
            await migration.down(trx);
            await trx
                .deleteFrom("migrations")
                .where("name", "=", migration.name)
                .execute();
        });
        console.log(`✓ Rolled back migration: ${migration.name}`);
    }
    async runMigrations(migrations) {
        const executed = await this.getExecutedMigrations();
        const pending = migrations.filter((m) => !executed.includes(m.name));
        if (pending.length === 0) {
            console.log("No pending migrations");
            return;
        }
        console.log(`Running ${pending.length} pending migrations...`);
        for (const migration of pending) {
            await this.executeMigration(migration);
        }
        console.log("All migrations completed successfully");
    }
}
exports.MigrationRunner = MigrationRunner;
