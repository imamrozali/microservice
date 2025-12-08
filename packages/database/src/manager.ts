import { DatabaseConfig } from './types';
import { DatabaseFactory, DatabaseDriver } from './factory';

export class DatabaseManager {
  private static instances = new Map<string, DatabaseDriver>();

  /**
   * Create or get a database connection
   */
  static create(name: string, config: DatabaseConfig): DatabaseDriver {
    if (this.instances.has(name)) {
      return this.instances.get(name)!;
    }

    const driver = DatabaseFactory.create(config);
    this.instances.set(name, driver);
    return driver;
  }

  /**
   * Get an existing connection
   */
  static get(name: string): DatabaseDriver | undefined {
    return this.instances.get(name);
  }

  /**
   * Check if connection exists
   */
  static has(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * Close a specific connection
   */
  static async close(name: string): Promise<void> {
    const driver = this.instances.get(name);
    if (driver) {
      await driver.close();
      this.instances.delete(name);
    }
  }

  /**
   * Close all connections
   */
  static async closeAll(): Promise<void> {
    const closePromises = Array.from(this.instances.values()).map((driver) =>
      driver.close()
    );
    await Promise.all(closePromises);
    this.instances.clear();
  }

  /**
   * Get all connection names
   */
  static getConnectionNames(): string[] {
    return Array.from(this.instances.keys());
  }
}
