import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

/** 数据库连接注入令牌 */
export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export type AppDatabase = NodePgDatabase<typeof schema>;

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (): AppDatabase => {
        const connectionString =
          process.env.DATABASE_URL ||
          'postgres://postgres:postgres@127.0.0.1:5432/graffiti';
        const pool = new Pool({ connectionString });
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
