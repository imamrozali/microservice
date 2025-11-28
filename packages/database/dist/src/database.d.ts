import { Kysely } from "kysely";
import { DatabaseMain, DatabaseLogs } from "./types";
export declare function getDatabaseMain(): Kysely<DatabaseMain>;
export declare function getDatabaseLogs(): Kysely<DatabaseLogs>;
export declare function getDatabase(databaseName: "main"): Kysely<DatabaseMain>;
export declare function getDatabase(databaseName: "logs"): Kysely<DatabaseLogs>;
export declare function closeDatabases(): Promise<void>;
