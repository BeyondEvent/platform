import { ConfigurationError } from '@beyondevent/shared';
import { EnvSchema } from './schema';
import type { Env } from './schema';

let cached: Env | undefined;

export function loadConfig(): Env {
  if (cached !== undefined) return cached;

  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new ConfigurationError(`Invalid environment variables:\n${issues}`);
  }

  cached = result.data;
  return cached;
}
