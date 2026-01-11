require('dotenv').config();
const { Pool } = require('pg');

async function testRenderConnection() {
  console.log('\n=== Testing Render Database Connection ===\n');

  // Check if DATABASE_URL is set (Render sets this automatically)
  if (process.env.DATABASE_URL) {
    console.log('✓ DATABASE_URL environment variable found');
    console.log('  Connection string format:', process.env.DATABASE_URL.substring(0, 30) + '...\n');
    
    // Test connection using DATABASE_URL
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Required for Render
      }
    });

    try {
      console.log('Attempting to connect to Render database...');
      const client = await pool.connect();
      console.log('✓ Successfully connected to Render database!\n');

      // Get database info
      const dbInfo = await client.query('SELECT version(), current_database(), current_user');
      console.log('Database Information:');
      console.log('  Version:', dbInfo.rows[0].version.split(' ')[0], dbInfo.rows[0].version.split(' ')[1]);
      console.log('  Database:', dbInfo.rows[0].current_database);
      console.log('  User:', dbInfo.rows[0].current_user);
      console.log('');

      // Check if tables exist
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;
      const tables = await client.query(tablesQuery);
      
      if (tables.rows.length > 0) {
        console.log('✓ Existing Tables:', tables.rows.length);
        tables.rows.forEach(row => console.log('  -', row.table_name));
      } else {
        console.log('⚠ No tables found in database (needs initialization)');
      }
      console.log('');

      // Check users table if it exists
      if (tables.rows.some(r => r.table_name === 'users')) {
        const userCount = await client.query('SELECT COUNT(*) FROM users');
        console.log('✓ Users table:', userCount.rows[0].count, 'users');
        
        const users = await client.query('SELECT user_id, username, email, role FROM users ORDER BY user_id');
        users.rows.forEach(user => {
          console.log(`  - ${user.username} (${user.role}) - ${user.email}`);
        });
      }
      console.log('');

      client.release();
      await pool.end();
      console.log('✓ Connection test completed successfully!\n');
      process.exit(0);

    } catch (error) {
      console.error('✗ Connection failed!');
      console.error('Error:', error.message);
      console.error('\nTroubleshooting:');
      console.error('1. Verify DATABASE_URL is correct in Render dashboard');
      console.error('2. Check if database is active (not paused)');
      console.error('3. Ensure SSL is enabled for external connections');
      console.error('4. Check IP whitelist settings\n');
      await pool.end();
      process.exit(1);
    }

  } else {
    console.log('✗ DATABASE_URL not found\n');
    console.log('Local database configuration:');
    console.log('  Host:', process.env.DB_HOST || 'localhost');
    console.log('  Database:', process.env.DB_NAME || 'quotation_db');
    console.log('  User:', process.env.DB_USER || 'postgres');
    console.log('  Port:', process.env.DB_PORT || 5432);
    console.log('\nThis appears to be a local environment.');
    console.log('To test Render database, set DATABASE_URL environment variable.\n');
    
    // Test local connection
    const localPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'quotation_db',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
    });

    try {
      console.log('Testing local database connection...');
      const client = await localPool.connect();
      console.log('✓ Local database connected successfully!\n');
      
      const dbInfo = await client.query('SELECT current_database(), current_user');
      console.log('Local Database:', dbInfo.rows[0].current_database);
      console.log('User:', dbInfo.rows[0].current_user);
      
      client.release();
      await localPool.end();
      process.exit(0);
    } catch (error) {
      console.error('✗ Local connection failed:', error.message);
      await localPool.end();
      process.exit(1);
    }
  }
}

testRenderConnection();
