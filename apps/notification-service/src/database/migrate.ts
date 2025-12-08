import { dbMain, dbLogs } from './connection';
import fs from 'fs';
import path from 'path';

async function run() {
  console.log("Running migrations...");

  const databases = [
    { db: dbMain, service: 'notification-service-main', migrationsDir: '../../migrations/main' },
    { db: dbLogs, service: 'notification-service-logs', migrationsDir: '../../migrations/logs' },
  ];

  for (const { db, service, migrationsDir } of databases) {
    const hasTable = await db.schema.hasTable('migrations');
    if (!hasTable) {
      await db.schema
        .createTable('migrations', (table) => {
          table.increments('id').primary();
          table.string('service', 100).notNullable();
          table.string('name').notNullable();
          table.timestamp('executed_at').defaultTo(db.fn.now());
          table.unique(['service', 'name']);
        });
    }

    const executed = await db
      .select('name')
      .from('migrations')
      .where('service', service);

    const done = new Map(executed.map(m => [m.name, true]));

    const files = fs
      .readdirSync(path.join(__dirname, migrationsDir))
      .filter(f => f.endsWith('.ts') || f.endsWith('.js'))
      .sort(); // Sort to ensure consistent order

    // Run migrations sequentially
    await files.reduce(async (promise, file) => {
      await promise;

      const name = file.replace(/\.(ts|js)$/, '');

      if (done.has(name)) {
        console.log(`⏭ Skipping: ${name}`);
        return;
      }

      console.log(`▶ Running: ${name}`);

      const migration = await import(path.join(__dirname, migrationsDir, file));
      await migration.up(db);

      await db('migrations').insert({ service, name });

      console.log(`Done: ${name}`);
    }, Promise.resolve());

    console.log(`All migrations completed for ${service}!`);
    await db.destroy();
  }
}

run();
