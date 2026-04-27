// Migration script for authentication and auto-detection features
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

console.log('🔄 Starting database migration for authentication and auto-detection...\n');

// Get password from environment, handle it carefully
const password = process.env.POSTGRES_PASSWORD;

// Create pool configuration
const poolConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'aria_postmortem',
  user: process.env.POSTGRES_USER || 'postgres',
};

// Only add password if it exists and is a non-empty string
if (password && typeof password === 'string' && password.trim() !== '') {
  poolConfig.password = password;
}

console.log('Database configuration:');
console.log(`  Host: ${poolConfig.host}`);
console.log(`  Port: ${poolConfig.port}`);
console.log(`  Database: ${poolConfig.database}`);
console.log(`  User: ${poolConfig.user}`);
console.log(`  Password: ${password ? '***' : '(none)'}\n`);

const pool = new Pool(poolConfig);

async function runMigration() {
  try {
    // Test connection
    console.log('Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../lib/db/auth-schema.sql');
    console.log(`Reading schema from: ${schemaPath}`);
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await pool.query(statement);
        const preview = statement.substring(0, 60).replace(/\n/g, ' ');
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
      } catch (error) {
        // Ignore "already exists" errors
        if (error.code === '42P07' || error.code === '42710' || error.code === '42701') {
          const preview = statement.substring(0, 60).replace(/\n/g, ' ');
          console.log(`⚠️  [${i + 1}/${statements.length}] Already exists: ${preview}...`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nCreated/Updated tables:');
    console.log('  - users');
    console.log('  - sessions');
    console.log('  - audit_logs');
    console.log('  - postmortem_comments');
    console.log('\nUpdated tables:');
    console.log('  - incidents (added auto-detection columns)');
    console.log('  - slack_messages (added auto-detection columns)');
    console.log('\n🎉 Ready to use! Run: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
