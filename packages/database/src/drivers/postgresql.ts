import { Knex, knex } from 'knex';
import { PostgreSQLConfig } from '../types';

export class PostgreSQLDriver {
  private client: Knex;

  constructor(config: PostgreSQLConfig) {
    this.client = knex({
      client: 'pg',
      connection: {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        ssl: config.ssl ? { rejectUnauthorized: false } : false,
      },
      pool: {
        min: config.min || 2,
        max: config.max || 10,
      },
      searchPath: config.searchPath || ['public'],
    });
  }

  getClient(): Knex {
    return this.client;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.raw('SELECT 1');
      return true;
    } catch (error) {
      console.error('PostgreSQL connection failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.client.destroy();
  }
}
