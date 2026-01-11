require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');
const runMigrations = require('./migrations/run-migrations');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for both local and Render
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow Render domains
    if (origin.includes('.onrender.com')) {
      return callback(null, true);
    }
    
    // Reject other origins in production
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Quotation Management System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server with migrations
async function startServer() {
  try {
    // Run database migrations
    await runMigrations();
    console.log('✓ Database migrations completed');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
