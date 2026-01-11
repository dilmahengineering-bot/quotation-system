const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const customerRoutes = require('./customerRoutes');
const machineRoutes = require('./machineRoutes');
const auxiliaryRoutes = require('./auxiliaryRoutes');
const quotationRoutes = require('./quotationRoutes');

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Quotation Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/machines', machineRoutes);
router.use('/auxiliary-costs', auxiliaryRoutes);
router.use('/quotations', quotationRoutes);

module.exports = router;
