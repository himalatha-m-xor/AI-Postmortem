// Migration script for authentication and auto-detection features
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✅ Loaded environment variables from .env.local\n');
} else {
  console.warn('⚠️  Warning: .env.local not found, using default values\n');
}

// Import the existing database pool (after env vars are loaded)
import { getPool, closePool } from '../lib/db/pool';

const pool = getPool();

async function runMigration() {
  console.log('🔄 Starting database migration for authentication and auto-detection...\n');

  try {
    // Test database connection first
    console.log('Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Read the schema file
    const schemaPath = path.join(__dirname, '../lib/db/auth-schema.sql');
    console.log(`Reading schema from: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.code !== '42P07' && error.code !== '42710') {
          throw error;
        }
        console.log(`⚠️  Skipped (already exists): ${statement.substring(0, 50)}...`);
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nCreated tables:');
    console.log('  - users');
    console.log('  - sessions');
    console.log('  - audit_logs');
    console.log('  - postmortem_comments');
    console.log('\nUpdated tables:');
    console.log('  - incidents (added auto-detection columns)');
    console.log('  - slack_messages (added auto-detection columns)');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

runMigration();
