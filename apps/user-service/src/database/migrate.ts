import { db } from './connection';
import fs from 'fs';
import path from 'path';

async function run() {
  console.log("Running migrations...");

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
    .where('service', 'user-service');

  const done = new Map(executed.map(m => [m.name, true]));

  const migrationsDir = path.join(__dirname, '../../migrations');
  const files = fs
    .readdirSync(migrationsDir)
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

    const migration = await import(path.join(migrationsDir, file));
    await migration.up(db);

    await db('migrations').insert({ service: 'user-service', name });

    console.log(`Done: ${name}`);
  }, Promise.resolve());

  console.log("All migrations completed!");
  await db.destroy();
}

run();
