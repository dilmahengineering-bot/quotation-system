require('dotenv').config();
const pool = require('../config/database');

async function addPasswordManagementFeatures() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Adding password management features...');
    
    // Add require_password_change column
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS require_password_change BOOLEAN DEFAULT false
    `);
    
    console.log('✓ Added require_password_change column');
    
    // Add password_changed_at column to track last password change
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP
    `);
    
    console.log('✓ Added password_changed_at column');
    
    // Update existing users to set password_changed_at to created_at
    await client.query(`
      UPDATE users 
      SET password_changed_at = created_at 
      WHERE password_changed_at IS NULL
    `);
    
    console.log('✓ Updated existing users password_changed_at');
    
    await client.query('COMMIT');
    console.log('\n✅ Password management migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  addPasswordManagementFeatures()
    .then(() => {
      console.log('Migration complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

module.exports = addPasswordManagementFeatures;
