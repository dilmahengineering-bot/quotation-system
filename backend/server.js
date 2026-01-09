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
