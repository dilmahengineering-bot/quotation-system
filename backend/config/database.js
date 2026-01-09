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
    min: 4, // Increased minimum number of clients
    idleTimeoutMillis: 60000, // Increased to 60 seconds
    connectionTimeoutMillis: 15000, // Increased to 15 seconds
    maxUses: 7500, // Close connection after 7500 queries
    allowExitOnIdle: false, // Keep process alive
    keepAlive: true, // Enable TCP keepalive
    keepAliveInitialDelayMillis: 10000, // Start keepalive after 10 seconds
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
    min: 4,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 15000,
    maxUses: 7500,
    allowExitOnIdle: false,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  };
}

const pool = new Pool(poolConfig);

// Track connection statistics
let connectionCount = 0;
let errorCount = 0;
let lastSuccessfulQuery = Date.now();
let isHealthy = false;

// Handle pool errors and implement automatic recovery
pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client:', err.message);
  console.error('   Error details:', err.code || 'UNKNOWN_ERROR');
  errorCount++;
  isHealthy = false;
  
  // Log specific error types for troubleshooting
  if (err.code === 'ECONNRESET') {
    console.error('   Connection was reset by the server');
  } else if (err.code === 'ETIMEDOUT') {
    console.error('   Connection timed out');
  } else if (err.code === 'ENOTFOUND') {
    console.error('   Database host not found');
  }
  
  if (errorCount > 10) {
    console.error('⚠️  Too many connection errors detected. Pool will attempt automatic recovery.');
    errorCount = 0; // Reset counter to allow continued monitoring
  }
});

// Monitor pool events
pool.on('connect', (client) => {
  connectionCount++;
  isHealthy = true;
  errorCount = 0; // Reset error count on successful connection
  console.log(`✅ New database connection established (Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount})`);
  
  // Set up client-level error handling
  client.on('error', (err) => {
    console.error('❌ Client error:', err.message);
  });
});

pool.on('acquire', (client) => {
  console.log(`📝 Client acquired from pool (Total: ${pool.totalCount}, Idle: ${pool.idleCount})`);
});

pool.on('remove', (client) => {
  console.log(`🔄 Client removed from pool (Total: ${pool.totalCount}, Idle: ${pool.idleCount})`);
});

// Enhanced query function with automatic retry and connection validation
const originalQuery = pool.query.bind(pool);
pool.query = async function(...args) {
  const maxRetries = 5; // Increased retries
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Validate connection health before query
      if (!isHealthy && attempt === 1) {
        console.log('⚠️  Connection health check before query...');
        await pool.query('SELECT 1');
        isHealthy = true;
      }
      
      const result = await originalQuery(...args);
      lastSuccessfulQuery = Date.now();
      isHealthy = true;
      return result;
    } catch (error) {
      lastError = error;
      isHealthy = false;
      
      console.error(`❌ Query error (attempt ${attempt}/${maxRetries}):`, error.message);
      
      // Retry on connection-related errors
      const shouldRetry = 
        error.message.includes('Connection terminated') ||
        error.message.includes('connect ETIMEDOUT') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('Connection closed') ||
        error.message.includes('Connection lost') ||
        error.message.includes('EPIPE') ||
        error.message.includes('ECONNRESET') ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === '57P01' || // admin_shutdown
        error.code === '57P03' || // cannot_connect_now
        error.code === '08006' || // connection_failure
        error.code === '08003'; // connection_does_not_exist
      
      if (attempt < maxRetries && shouldRetry) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff with max 10s
        console.warn(`   Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
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
const heartbeatInterval = 2 * 60 * 1000; // Check every 2 minutes (increased frequency)
let heartbeatFailures = 0;

const performHeartbeat = async () => {
  try {
    const start = Date.now();
    await pool.query('SELECT 1 as heartbeat, NOW() as current_time');
    const duration = Date.now() - start;
    
    isHealthy = true;
    heartbeatFailures = 0;
    console.log(`💓 Database heartbeat OK (${duration}ms) - Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Active: ${pool.totalCount - pool.idleCount}`);
    
    // Warn if heartbeat is slow
    if (duration > 1000) {
      console.warn(`⚠️  Slow heartbeat detected (${duration}ms) - Database may be under load`);
    }
    
  } catch (err) {
    heartbeatFailures++;
    isHealthy = false;
    console.error(`💔 Database heartbeat failed (${heartbeatFailures} consecutive failures):`, err.message);
    
    // Attempt to recover connection after multiple failures
    if (heartbeatFailures >= 3) {
      console.error('⚠️  Multiple heartbeat failures detected. Attempting connection recovery...');
      try {
        // Force new connection by querying
        await pool.query('SELECT version()');
        console.log('✅ Connection recovery successful');
        heartbeatFailures = 0;
        isHealthy = true;
      } catch (recoveryErr) {
        console.error('❌ Connection recovery failed:', recoveryErr.message);
      }
    }
  }
};

// Start heartbeat
setInterval(performHeartbeat, heartbeatInterval);

// Initial heartbeat after 30 seconds
setTimeout(performHeartbeat, 30000);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing database pool...');
  try {
    await pool.end();
    console.log('✅ Database pool closed gracefully');
  } catch (err) {
    console.error('❌ Error closing pool:', err.message);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, closing database pool...');
  try {
    await pool.end();
    console.log('✅ Database pool closed gracefully');
  } catch (err) {
    console.error('❌ Error closing pool:', err.message);
  }
  process.exit(0);
});

// Export pool with health check method
pool.isHealthy = () => isHealthy;
pool.getStats = () => ({
  totalConnections: pool.totalCount,
  idleConnections: pool.idleCount,
  waitingClients: pool.waitingCount,
  lastSuccessfulQuery: new Date(lastSuccessfulQuery),
  isHealthy,
  connectionCount,
  errorCount
});

module.exports = pool;
