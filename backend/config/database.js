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
    max: 20, // Maximum number of clients
    min: 2, // Minimum number of clients
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Return error after 10 seconds
    maxUses: 7500, // Close connection after 7500 queries
    allowExitOnIdle: false, // Keep process alive
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
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    maxUses: 7500,
    allowExitOnIdle: false,
  };
}

const pool = new Pool(poolConfig);

// Track connection statistics
let connectionCount = 0;
let errorCount = 0;

// Handle pool errors and implement retry logic
pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client:', err.message);
  errorCount++;
  
  if (errorCount > 10) {
    console.error('⚠️  Too many connection errors. Consider restarting the service.');
  }
  
  // Don't exit the process, connection pool will handle reconnection
});

// Monitor pool events
pool.on('connect', (client) => {
  connectionCount++;
  console.log(`✅ New database connection established (Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount})`);
});

pool.on('acquire', (client) => {
  console.log(`📝 Client acquired from pool (Total: ${pool.totalCount}, Idle: ${pool.idleCount})`);
});

pool.on('remove', (client) => {
  console.log(`🔄 Client removed from pool (Total: ${pool.totalCount}, Idle: ${pool.idleCount})`);
});

// Enhanced query function with automatic retry
const originalQuery = pool.query.bind(pool);
pool.query = async function(...args) {
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await originalQuery(...args);
    } catch (error) {
      lastError = error;
      
      // Retry only on connection-related errors
      if (attempt < maxRetries && (
        error.message.includes('Connection terminated') ||
        error.message.includes('connect ETIMEDOUT') ||
        error.message.includes('ECONNREFUSED') ||
        error.code === 'ECONNRESET'
      )) {
        console.warn(`⚠️  Query failed (attempt ${attempt}/${maxRetries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
};

// Test database connection on startup with retry
async function testConnection(retries = 5) {
  for (let i = 1; i <= retries; i++) {
    try {
      const result = await pool.query('SELECT NOW() as now, version() as version');
      console.log('✅ Database connected successfully');
      console.log('  Time:', result.rows[0].now);
      console.log('  Version:', result.rows[0].version.split(',')[0]);
      console.log('  Pool size:', pool.totalCount);
      return true;
    } catch (err) {
      console.error(`❌ Database connection failed (attempt ${i}/${retries}):`, err.message);
      
      if (i < retries) {
        console.log(`   Retrying in ${i * 2} seconds...`);
        await new Promise(resolve => setTimeout(resolve, i * 2000));
      } else {
        console.error('\n⚠️  Database connection could not be established.');
        console.error('Please check:');
        console.error('1. PostgreSQL service is running');
        console.error('2. DATABASE_URL or DB_* environment variables are correct');
        console.error('3. Database exists and is accessible');
        console.error('4. Network connectivity to database\n');
      }
    }
  }
  return false;
}

// Run connection test
testConnection();

// Keep connection pool alive with periodic health checks
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
    console.log(`💓 Database heartbeat OK (Total: ${pool.totalCount}, Idle: ${pool.idleCount})`);
  } catch (err) {
    console.error('💔 Database heartbeat failed:', err.message);
  }
}, 60000); // Check every minute

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, closing database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

module.exports = pool;
