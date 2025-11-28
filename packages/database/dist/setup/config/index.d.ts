import { type DatabaseConfig } from "../../src/config";
export declare const databaseConfigs: Record<string, DatabaseConfig>;
export declare function getDatabaseConfig(name: string): DatabaseConfig;
export declare function getAvailableDatabases(): string[];
export * from "../../src/config";
