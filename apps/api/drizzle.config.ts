import { resolve } from 'node:path';
import { defineConfig } from 'drizzle-kit';

// Load root .env so drizzle-kit CLI picks up DATABASE_URL without dotenv dependency.
// process.loadEnvFile is Node 20.12+ built-in; silently ignored if file is absent.
try {
  process.loadEnvFile(resolve(process.cwd(), '../../.env'));
} catch {
  /* .env is optional in CI / prod where vars come from the environment */
}

export default defineConfig({
  schema: './src/db/schema',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
});
