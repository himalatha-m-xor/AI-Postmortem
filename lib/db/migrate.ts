// Database Migration Script
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getPool } from './pool';
import { logger } from '@/lib/logger';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

export async function runMigrations() {
  try {
    logger.info('Running database migrations...');

    const pool = getPool();
    const schemaSQL = readFileSync(join(process.cwd(), 'lib', 'db', 'schema.sql'), 'utf8');

    await pool.query(schemaSQL);

    logger.info('✅ Database migrations completed successfully');
    return true;
  } catch (error) {
    logger.error('❌ Database migration failed', error as Error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✅ Migrations complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration error:', error);
      process.exit(1);
    });
}
