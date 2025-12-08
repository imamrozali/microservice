import { db } from './connection';
import * as path from 'path';
import * as fs from 'fs';

async function runSeeds() {
  console.log('Running seeds...');

  const seedsDir = path.join(__dirname, '../../seeds');

  // Check if seeds directory exists
  if (!fs.existsSync(seedsDir)) {
    console.log('No seeds directory found.');
    await db.destroy();
    return;
  }

  const files = fs
    .readdirSync(seedsDir)
    .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
    .sort();

  try {
    for (const file of files) {
      const seedName = file.replace(/\.(ts|js)$/, '');
      console.log(`Running seed: ${seedName}`);

      const seed = await import(path.join(seedsDir, file));

      if (typeof seed.seed === 'function') {
        await seed.seed(db);
      }
    }

    console.log('All seeds completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runSeeds();
