import { Knex, knex } from 'knex';
import { OracleConfig } from '../types';

export class OracleDriver {
  private client: Knex;

  constructor(config: OracleConfig) {
    this.client = knex({
      client: 'oracledb',
      connection: {
        user: config.user,
        password: config.password,
        connectString:
          config.connectString ||
          `${config.host}:${config.port}/${config.database}`,
      },
      pool: {
        min: config.poolMin || 1,
        max: config.poolMax || 10,
      },
    });
  }

  getClient(): Knex {
    return this.client;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.raw('SELECT 1 FROM DUAL');
      return true;
    } catch (error) {
      console.error('Oracle connection failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.client.destroy();
  }
}
