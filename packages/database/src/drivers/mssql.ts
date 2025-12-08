import { Knex, knex } from 'knex';
import { MSSQLConfig } from '../types';

export class MSSQLDriver {
  private client: Knex;

  constructor(config: MSSQLConfig) {
    this.client = knex({
      client: 'mssql',
      connection: {
        server: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        options: {
          encrypt: config.options?.encrypt ?? true,
          trustServerCertificate: config.options?.trustServerCertificate ?? false,
        },
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
      console.error('MSSQL connection failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.client.destroy();
  }
}
