const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const auxiliaryController = require('../controllers/auxiliaryController');
const { authenticateToken, hasPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authenticateToken);

// Get all auxiliary costs
router.get('/', hasPermission('auxiliary:read'), auxiliaryController.getAllAuxiliaryCosts);

// Get auxiliary cost by ID
router.get('/:id',
  hasPermission('auxiliary:read'),
  [param('id').isUUID().withMessage('Invalid auxiliary cost ID')],
  validate,
  auxiliaryController.getAuxiliaryCostById
);

// Create auxiliary cost
router.post('/',
  hasPermission('auxiliary:create'),
  [
    body('auxType').trim().notEmpty().withMessage('Auxiliary type is required'),
    body('description').optional().trim(),
    body('defaultCost').optional().isFloat({ min: 0 }).withMessage('Default cost must be a positive number')
  ],
  validate,
  auxiliaryController.createAuxiliaryCost
);

// Update auxiliary cost
router.put('/:id',
  hasPermission('auxiliary:update'),
  [
    param('id').isUUID().withMessage('Invalid auxiliary cost ID'),
    body('auxType').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('defaultCost').optional().isFloat({ min: 0 }),
    body('isActive').optional().isBoolean()
  ],
  validate,
  auxiliaryController.updateAuxiliaryCost
);

// Delete auxiliary cost
router.delete('/:id',
  hasPermission('auxiliary:delete'),
  [param('id').isUUID().withMessage('Invalid auxiliary cost ID')],
  validate,
  auxiliaryController.deleteAuxiliaryCost
);

module.exports = router;
