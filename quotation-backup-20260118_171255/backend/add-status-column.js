require('dotenv').config();
const pool = require('./config/database');

async function addStatusColumn() {
  try {
    console.log('Adding status column to quotations table...');
    
    await pool.query(`
      ALTER TABLE quotations 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft'
    `);
    
    console.log('✅ Status column added successfully');
    
    // Verify
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'quotations' 
      AND column_name = 'status'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verified: Status column exists');
    } else {
      console.log('❌ Failed: Status column not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addStatusColumn();
