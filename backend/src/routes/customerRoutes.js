const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const customerController = require('../controllers/customerController');
const { authenticateToken, hasPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authenticateToken);

// Get all customers
router.get('/', hasPermission('customers:read'), customerController.getAllCustomers);

// Get customer by ID
router.get('/:id',
  hasPermission('customers:read'),
  [param('id').isUUID().withMessage('Invalid customer ID')],
  validate,
  customerController.getCustomerById
);

// Get customer quotations
router.get('/:id/quotations',
  hasPermission('customers:read'),
  [param('id').isUUID().withMessage('Invalid customer ID')],
  validate,
  customerController.getCustomerQuotations
);

// Create customer
router.post('/',
  hasPermission('customers:create'),
  [
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('address').optional().trim(),
    body('contactPersonName').optional().trim(),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('phone').optional().trim(),
    body('vatNumber').optional().trim()
  ],
  validate,
  customerController.createCustomer
);

// Update customer
router.put('/:id',
  hasPermission('customers:update'),
  [
    param('id').isUUID().withMessage('Invalid customer ID'),
    body('companyName').optional().trim().notEmpty(),
    body('address').optional().trim(),
    body('contactPersonName').optional().trim(),
    body('email').optional().isEmail(),
    body('phone').optional().trim(),
    body('vatNumber').optional().trim(),
    body('isActive').optional().isBoolean()
  ],
  validate,
  customerController.updateCustomer
);

// Delete customer
router.delete('/:id',
  hasPermission('customers:delete'),
  [param('id').isUUID().withMessage('Invalid customer ID')],
  validate,
  customerController.deleteCustomer
);

module.exports = router;
