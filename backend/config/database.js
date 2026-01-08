const { Pool } = require('pg');

// Support both DATABASE_URL (Render) and individual env variables
const pool = new Pool(
  process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'quotation_db',
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
      }
);

module.exports = pool;
