export type DatabaseType = 'postgresql' | 'mysql' | 'sqlite' | 'mssql' | 'oracle' | 'mongodb';

export interface BaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface PostgreSQLConfig extends BaseConfig {
  type: 'postgresql';
  ssl?: boolean;
  max?: number;
  min?: number;
  searchPath?: string[];
}

export interface MySQLConfig extends BaseConfig {
  type: 'mysql';
  connectionLimit?: number;
}

export interface SQLiteConfig {
  type: 'sqlite';
  filename: string;
}

export interface MSSQLConfig extends BaseConfig {
  type: 'mssql';
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
  };
}

export interface OracleConfig extends BaseConfig {
  type: 'oracle';
  connectString?: string;
  poolMin?: number;
  poolMax?: number;
}

export interface MongoDBConfig {
  type: 'mongodb';
  uri: string;
  database: string;
  options?: {
    maxPoolSize?: number;
    minPoolSize?: number;
  };
}

export type DatabaseConfig =
  | PostgreSQLConfig
  | MySQLConfig
  | SQLiteConfig
  | MSSQLConfig
  | OracleConfig
  | MongoDBConfig;
