import { Kysely } from "kysely";
export interface Migration {
    name: string;
    up: (db: Kysely<any>) => Promise<void>;
    down?: (db: Kysely<any>) => Promise<void>;
}
export declare class MigrationRunner {
    private db;
    constructor(db: Kysely<any>);
    ensureMigrationTable(): Promise<void>;
    getExecutedMigrations(): Promise<string[]>;
    executeMigration(migration: Migration): Promise<void>;
    rollbackMigration(migration: Migration): Promise<void>;
    runMigrations(migrations: Migration[]): Promise<void>;
}
