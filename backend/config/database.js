const { Pool } = require('pg');

// Log environment info for debugging
console.log('🔍 Database Configuration:');
console.log('  DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('  DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('  DB_NAME:', process.env.DB_NAME || 'quotation_db');

// Support both DATABASE_URL (Render) and individual env variables
let poolConfig;

if (process.env.DATABASE_URL) {
  console.log('  Using DATABASE_URL for connection');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
} else {
  console.log('  Using individual environment variables');
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'quotation_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client:', err);
  // Don't exit the process, just log the error
});

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database credentials in .env file');
    console.error('3. Database "quotation_db" exists');
  } else {
    console.log('✅ Database connected successfully at', res.rows[0].now);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('Database pool has ended');
  });
});

module.exports = pool;
