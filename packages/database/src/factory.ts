import { DatabaseConfig } from './types';
import { PostgreSQLDriver } from './drivers/postgresql';
import { MySQLDriver } from './drivers/mysql';
import { SQLiteDriver } from './drivers/sqlite';
import { MSSQLDriver } from './drivers/mssql';
import { OracleDriver } from './drivers/oracle';
import { MongoDBDriver } from './drivers/mongodb';

export type DatabaseDriver =
  | PostgreSQLDriver
  | MySQLDriver
  | SQLiteDriver
  | MSSQLDriver
  | OracleDriver
  | MongoDBDriver;

export class DatabaseFactory {
  static create(config: DatabaseConfig): DatabaseDriver {
    switch (config.type) {
      case 'postgresql':
        return new PostgreSQLDriver(config);

      case 'mysql':
        return new MySQLDriver(config);

      case 'sqlite':
        return new SQLiteDriver(config);

      case 'mssql':
        return new MSSQLDriver(config);

      case 'oracle':
        return new OracleDriver(config);

      case 'mongodb':
        return new MongoDBDriver(config);

      default:
        throw new Error(`Unsupported database type: ${(config as { type: string }).type}`);
    }
  }
}
