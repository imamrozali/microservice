import { Knex, knex } from 'knex';
import { SQLiteConfig } from '../types';

export class SQLiteDriver {
  private client: Knex;

  constructor(config: SQLiteConfig) {
    this.client = knex({
      client: 'better-sqlite3',
      connection: {
        filename: config.filename,
      },
      useNullAsDefault: true,
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
      console.error('SQLite connection failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.client.destroy();
  }
}
