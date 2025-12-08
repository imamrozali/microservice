// Export configuration types
export * from './types';

// Export individual drivers
export { PostgreSQLDriver } from './drivers/postgresql';
export { MySQLDriver } from './drivers/mysql';
export { SQLiteDriver } from './drivers/sqlite';
export { MSSQLDriver } from './drivers/mssql';
export { OracleDriver } from './drivers/oracle';
export { MongoDBDriver } from './drivers/mongodb';

// Export factory and manager
export { DatabaseFactory } from './factory';
export type { DatabaseDriver } from './factory';
export { DatabaseManager } from './manager';

// Re-export Knex types for convenience
export type { Knex } from 'knex';
export type { Db, MongoClient, Collection } from 'mongodb';