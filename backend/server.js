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

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Quotation Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      setup: '/setup-db'
    }
  });
});

// Database setup route (for initial deployment)
app.get('/setup-db', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const pool = require('./config/database');
    
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    
    res.json({ 
      status: 'success', 
      message: 'Database initialized successfully!' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Routes
app.use('/api', routes);

// Health check with database connectivity
app.get('/health', async (req, res) => {
  try {
    const pool = require('./config/database');
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      message: 'Quotation Management System API',
      database: 'Connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message
    });
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
  
  // Start keep-alive service for Render
  const { startKeepAlive } = require('./utils/keepAlive');
  startKeepAlive();
});

module.exports = app;
