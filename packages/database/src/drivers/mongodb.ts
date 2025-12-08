import { MongoClient, Db } from 'mongodb';
import { MongoDBConfig } from '../types';

export class MongoDBDriver {
  private client: MongoClient;
  private db: Db | null = null;
  private config: MongoDBConfig;

  constructor(config: MongoDBConfig) {
    this.config = config;
    this.client = new MongoClient(config.uri, {
      maxPoolSize: config.options?.maxPoolSize || 10,
      minPoolSize: config.options?.minPoolSize || 2,
    });
  }

  async connect(): Promise<void> {
    if (!this.db) {
      await this.client.connect();
      this.db = this.client.db(this.config.database);
    }
  }

  getClient(): MongoClient {
    return this.client;
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return this.db;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect();
      await this.db!.command({ ping: 1 });
      return true;
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.client.close();
    this.db = null;
  }
}
