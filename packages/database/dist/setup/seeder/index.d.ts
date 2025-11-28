import { Kysely } from "kysely";
import { DatabaseMain, DatabaseLogs } from "../../src/types";
export interface Seeder {
    name: string;
    run: (dbMain: Kysely<DatabaseMain>, dbLogs?: Kysely<DatabaseLogs>) => Promise<void>;
}
export declare class SeederRunner {
    private dbMain;
    private dbLogs?;
    constructor(dbMain: Kysely<DatabaseMain>, dbLogs?: Kysely<DatabaseLogs> | undefined);
    ensureSeederTable(): Promise<void>;
    getExecutedSeeders(): Promise<string[]>;
    executeSeeder(seeder: Seeder): Promise<void>;
    runSeeders(seeders: Seeder[]): Promise<void>;
}
