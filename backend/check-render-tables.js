require('dotenv').config();
const { Pool } = require('pg');

// Use DATABASE_URL from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkTables() {
  try {
    console.log('🔗 Connecting to Render PostgreSQL...\n');

    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log(`📊 Found ${tablesResult.rows.length} tables:\n`);
    tablesResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });

    // Check row counts for each table
    console.log('\n📈 Row counts:\n');
    for (const row of tablesResult.rows) {
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${row.table_name}`);
      console.log(`   ${row.table_name}: ${countResult.rows[0].count} rows`);
    }

    // Check users specifically
    console.log('\n👥 Users in database:\n');
    const usersResult = await pool.query('SELECT user_id, username, role FROM users ORDER BY user_id');
    usersResult.rows.forEach(user => {
      console.log(`   - ${user.username} (${user.role})`);
    });

    console.log('\n✅ Database check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();
