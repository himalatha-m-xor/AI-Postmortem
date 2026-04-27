// PostgreSQL Connection Pool
import { Pool } from 'pg';
import { config } from '@/lib/config';
import { logger } from '@/lib/logger';

// Create a singleton connection pool
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    // Use environment variables directly to avoid any type issues
    const password = process.env.POSTGRES_PASSWORD;

    const poolConfig: any = {
      database: process.env.POSTGRES_DB || 'aria_postmortem',
      user: process.env.POSTGRES_USER || 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    // Only add password if it exists and is a string
    if (password && typeof password === 'string' && password.trim() !== '') {
      poolConfig.password = password;
    }

    pool = new Pool(poolConfig);

    pool.on('error', (err) => {
      logger.error('Unexpected error on idle PostgreSQL client', err);
    });

    // Only log in debug mode
    if (config.debug) {
      logger.info(`PostgreSQL pool created: ${poolConfig.database}@${poolConfig.host}:${poolConfig.port}`);
    }
  }

  return pool;
}

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (config.debug) {
      logger.debug(`Executed query in ${duration}ms`, { text, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    logger.error('Database query error', error as Error, { text, params });
    throw error;
  }
}

// Close the pool (useful for graceful shutdown)
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('PostgreSQL pool closed');
  }
}
