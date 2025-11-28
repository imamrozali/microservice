"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRolesTable = void 0;
const kysely_1 = require("kysely");
exports.createRolesTable = {
    name: "001_create_roles_table",
    up: async (db) => {
        await db.schema
            .createTable("roles")
            .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
            .addColumn("code", "varchar(50)", (col) => col.notNull().unique())
            .addColumn("name", "varchar(100)", (col) => col.notNull())
            .addColumn("created_at", "timestamp", (col) => col.defaultTo((0, kysely_1.sql) `CURRENT_TIMESTAMP`).notNull())
            .execute();
        // Create indexes
        await db.schema
            .createIndex("idx_roles_code")
            .on("roles")
            .column("code")
            .execute();
    },
    down: async (db) => {
        await db.schema.dropTable("roles").execute();
    },
};
