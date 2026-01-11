const { Pool } = require('pg');

// Render sets DATABASE_URL automatically when you link a PostgreSQL database
// For local development, use individual DB_ environment variables
const pool = new Pool(
  process.env.DATABASE_URL ? {
    // Render/Production configuration (uses DATABASE_URL)
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Render and most cloud PostgreSQL services
    }
  } : {
    // Local development configuration
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'quotation_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  }
);

// Log connection info (without sensitive data)
if (process.env.DATABASE_URL) {
  console.log('🔗 Using DATABASE_URL for database connection (Render/Production)');
} else {
  console.log(`🔗 Using local database: ${process.env.DB_NAME || 'quotation_db'} on ${process.env.DB_HOST || 'localhost'}`);
}

module.exports = pool;
