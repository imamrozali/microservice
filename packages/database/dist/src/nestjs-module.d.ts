import { DynamicModule } from "@nestjs/common";
import { Kysely } from "kysely";
import { DatabaseMain, DatabaseLogs } from "./types";
export declare const DATABASE_MAIN_TOKEN = "DATABASE_MAIN";
export declare const DATABASE_LOGS_TOKEN = "DATABASE_LOGS";
export declare class DatabaseService {
    private readonly mainDb;
    private readonly logsDb;
    constructor(mainDb: Kysely<DatabaseMain>, logsDb: Kysely<DatabaseLogs>);
    get main(): Kysely<DatabaseMain>;
    get logs(): Kysely<DatabaseLogs>;
}
export declare class DatabaseModule {
    static forRoot(): DynamicModule;
    static forFeature(databases: ("main" | "logs")[]): DynamicModule;
}
