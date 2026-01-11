const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load database configuration
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'quotation_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  try {
    console.log('Starting migration: update_auxiliary_costs_structure');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'update_auxiliary_costs_structure.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by statement (simple split by semicolon)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s !== '');
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      console.log(statement.substring(0, 100) + '...');
      
      try {
        const result = await pool.query(statement);
        console.log(`✓ Statement ${i + 1} executed successfully`);
        if (result.rows && result.rows.length > 0) {
          console.log('Result:', result.rows);
        }
      } catch (err) {
        // Ignore "column already exists" errors
        if (err.message.includes('already exists') || err.message.includes('does not exist')) {
          console.log(`⚠ Warning: ${err.message} (continuing...)`);
        } else {
          throw err;
        }
      }
    }
    
    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
