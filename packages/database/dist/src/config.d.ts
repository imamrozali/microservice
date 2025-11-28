export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}
export declare function createDatabaseConfig(prefix: string): DatabaseConfig;
export declare const dbMainConfig: DatabaseConfig;
export declare const dbLogsConfig: DatabaseConfig;
