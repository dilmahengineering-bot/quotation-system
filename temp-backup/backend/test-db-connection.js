require('dotenv').config();
const { Client } = require('pg');

console.log('\n🔍 Testing Database Connection...\n');

const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'quotation_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
};

console.log('Configuration:');
console.log('  Host:', config.host);
console.log('  Port:', config.port);
console.log('  Database:', config.database);
console.log('  User:', config.user);
console.log('  Password:', config.password ? '***' + config.password.slice(-3) : 'not set');
console.log('');

const client = new Client(config);

async function testConnection() {
  try {
    console.log('⏳ Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    console.log('⏳ Testing query...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query successful!');
    console.log('  Current Time:', result.rows[0].current_time);
    console.log('  PostgreSQL Version:', result.rows[0].pg_version.split(',')[0]);
    console.log('');

    console.log('⏳ Checking tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('✅ Found', tables.rows.length, 'tables:');
      tables.rows.forEach(row => {
        console.log('  -', row.table_name);
      });
    } else {
      console.log('⚠️  No tables found. Run the schema.sql file to initialize the database.');
    }
    console.log('');

    console.log('⏳ Checking data...');
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) FROM machines'),
      client.query('SELECT COUNT(*) FROM customers'),
      client.query('SELECT COUNT(*) FROM auxiliary_costs'),
      client.query('SELECT COUNT(*) FROM quotations')
    ]);

    console.log('✅ Data counts:');
    console.log('  Machines:', counts[0].rows[0].count);
    console.log('  Customers:', counts[1].rows[0].count);
    console.log('  Auxiliary Costs:', counts[2].rows[0].count);
    console.log('  Quotations:', counts[3].rows[0].count);
    console.log('');

    console.log('✅ All tests passed! Database is ready.\n');

  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    
    if (error.message.includes('password authentication failed')) {
      console.error('  • Check DB_PASSWORD in .env file');
      console.error('  • Verify PostgreSQL user password');
    } else if (error.message.includes('does not exist')) {
      console.error('  • Create database: CREATE DATABASE quotation_db;');
      console.error('  • Run: psql -U postgres -c "CREATE DATABASE quotation_db;"');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('  • PostgreSQL service is not running');
      console.error('  • Check if PostgreSQL is installed');
      console.error('  • Verify DB_HOST and DB_PORT in .env file');
    } else {
      console.error('  • Check all .env file settings');
      console.error('  • Ensure PostgreSQL is running');
      console.error('  • Verify firewall/network settings');
    }
    console.error('');
    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection();
