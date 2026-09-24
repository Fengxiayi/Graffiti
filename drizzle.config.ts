import type { Config } from 'drizzle-kit';

export default {
  schema: './server/database/schema.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/graffiti',
  },
} satisfies Config;
