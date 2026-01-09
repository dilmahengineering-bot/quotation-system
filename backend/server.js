require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Quotation Management System API' });
});

// Setup database endpoint (initialize schema and sample data)
app.get('/setup-db', async (req, res) => {
  try {
    const pool = require('./config/database');
    const bcrypt = require('bcryptjs');
    const fs = require('fs');
    const path = require('path');

    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);

    // Update passwords with proper hashes
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('user123', 10);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2',
      [adminHash, 'admin']
    );

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2',
      [userHash, 'user']
    );

    res.json({ 
      status: 'success', 
      message: 'Database initialized successfully! Login: admin/admin123 or user/user123' 
    });
  } catch (error) {
    console.error('Setup database error:', error);
    res.status(500).json({ error: 'Database setup failed', details: error.message });
  }
});

// Create users table and add default users
app.get('/create-users', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const pool = require('./config/database');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Hash passwords
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('user123', 10);

    // Insert admin user
    await pool.query(
      `INSERT INTO users (username, password_hash, full_name, email, role) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (username) DO UPDATE SET password_hash = $2`,
      [adminHash, 'admin', 'System Administrator', 'admin@company.com', 'admin']
    );

    // Insert regular user
    await pool.query(
      `INSERT INTO users (username, password_hash, full_name, email, role) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (username) DO UPDATE SET password_hash = $2`,
      [userHash, 'user', 'Regular User', 'user@company.com', 'user']
    );

    res.json({ 
      status: 'success', 
      message: 'Users created! Login: admin/admin123 or user/user123' 
    });
  } catch (error) {
    console.error('Create users error:', error);
    res.status(500).json({ error: 'Failed to create users', details: error.message });
  }
});

// Fix passwords endpoint (for Render deployment)
app.get('/fix-passwords', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const pool = require('./config/database');
    
    // Hash passwords
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('user123', 10);

    // Update admin password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2',
      [adminHash, 'admin']
    );

    // Update user password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2',
      [userHash, 'user']
    );

    res.json({ 
      status: 'success', 
      message: 'Passwords updated! Login with: admin/admin123 or user/user123' 
    });
  } catch (error) {
    console.error('Error updating passwords:', error);
    res.status(500).json({ error: 'Failed to update passwords', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
