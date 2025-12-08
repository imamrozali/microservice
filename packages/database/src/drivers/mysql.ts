import { Knex, knex } from 'knex';
import { MySQLConfig } from '../types';

export class MySQLDriver {
  private client: Knex;

  constructor(config: MySQLConfig) {
    this.client = knex({
      client: 'mysql2',
      connection: {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
      },
      pool: {
        min: 2,
        max: config.connectionLimit || 10,
      },
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
      console.error('MySQL connection failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.client.destroy();
  }
}
