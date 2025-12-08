import { config } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const envCache = new Map<string, boolean>();

/**
 * Load root .env file from monorepo root
 * Contains shared variables (DB, Redis, RabbitMQ, etc)
 */
export function loadEnvRoot(): void {
  const cacheKey = 'root';
  
  if (envCache.has(cacheKey)) return;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const envPath = resolve(__dirname, '../../..', '.env');

  if (!existsSync(envPath)) {
    console.warn('[env] Warning: Root .env file not found at:', envPath);
    envCache.set(cacheKey, false);
    return;
  }

  const result = config({ path: envPath });
  
  if (result.error) {
    console.error('[env] Error loading root .env:', result.error);
    envCache.set(cacheKey, false);
    return;
  }

  envCache.set(cacheKey, true);
  console.log(`[env] ✓ Root .env loaded from: ${envPath}`);
}

/**
 * Load local .env file from service directory
 * Contains service-specific variables (PORT, API keys, etc)
 */
export function loadEnvLocal(): void {
  const cacheKey = 'local';
  
  if (envCache.has(cacheKey)) return;

  const localEnvPath = resolve(process.cwd(), '.env');

  if (!existsSync(localEnvPath)) {
    console.warn('[env] Warning: Local .env file not found at:', localEnvPath);
    envCache.set(cacheKey, false);
    return;
  }

  const result = config({ path: localEnvPath, override: true });
  
  if (result.error) {
    console.error('[env] Error loading local .env:', result.error);
    envCache.set(cacheKey, false);
    return;
  }

  envCache.set(cacheKey, true);
  console.log(`[env] ✓ Local .env loaded from: ${localEnvPath}`);
}

/**
 * Load both root and local .env files
 * Root is loaded first, then local (local overrides root)
 */
export function loadEnv(): void {
  loadEnvRoot();
  loadEnvLocal();
}