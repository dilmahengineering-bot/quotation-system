const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool(
  process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  } : {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'quotation_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  }
);

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migrations...');
    
    // Check if default_cost column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'part_auxiliary_costs' 
      AND column_name = 'default_cost'
    `);
    
    if (checkColumn.rows.length === 0) {
      console.log('Adding default_cost, quantity, notes columns...');
      
      // Add new columns
      await client.query(`
        ALTER TABLE part_auxiliary_costs 
        ADD COLUMN IF NOT EXISTS default_cost DECIMAL(10, 2),
        ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS notes TEXT
      `);
      
      // Migrate existing data
      await client.query(`
        UPDATE part_auxiliary_costs 
        SET default_cost = cost, quantity = 1 
        WHERE default_cost IS NULL
      `);
      
      // Set constraints
      await client.query(`
        ALTER TABLE part_auxiliary_costs 
        ALTER COLUMN default_cost SET NOT NULL,
        ALTER COLUMN default_cost SET DEFAULT 0,
        ALTER COLUMN quantity SET NOT NULL
      `);
      
      // Drop old cost column
      await client.query(`
        ALTER TABLE part_auxiliary_costs DROP COLUMN IF EXISTS cost
      `);
      
      // Add computed cost column
      await client.query(`
        ALTER TABLE part_auxiliary_costs 
        ADD COLUMN cost DECIMAL(10, 2) GENERATED ALWAYS AS (default_cost * quantity) STORED
      `);
      
      console.log('✓ Migration completed successfully!');
    } else {
      console.log('✓ Columns already exist, skipping migration');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = runMigrations;
