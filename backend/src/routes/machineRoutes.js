const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const machineController = require('../controllers/machineController');
const { authenticateToken, hasPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authenticateToken);

// Get machine types
router.get('/types', machineController.getMachineTypes);

// Get all machines
router.get('/', hasPermission('machines:read'), machineController.getAllMachines);

// Get machine by ID
router.get('/:id',
  hasPermission('machines:read'),
  [param('id').isUUID().withMessage('Invalid machine ID')],
  validate,
  machineController.getMachineById
);

// Create machine
router.post('/',
  hasPermission('machines:create'),
  [
    body('machineName').trim().notEmpty().withMessage('Machine name is required'),
    body('machineType')
      .isIn(['Milling', 'Turning', 'EDM', 'WEDM', 'Grinding', 'Drilling', 'Laser', 'Welding', 'Other'])
      .withMessage('Invalid machine type'),
    body('hourlyRate')
      .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
    body('description').optional().trim()
  ],
  validate,
  machineController.createMachine
);

// Update machine
router.put('/:id',
  hasPermission('machines:update'),
  [
    param('id').isUUID().withMessage('Invalid machine ID'),
    body('machineName').optional().trim().notEmpty(),
    body('machineType').optional()
      .isIn(['Milling', 'Turning', 'EDM', 'WEDM', 'Grinding', 'Drilling', 'Laser', 'Welding', 'Other']),
    body('hourlyRate').optional().isFloat({ min: 0 }),
    body('description').optional().trim(),
    body('isActive').optional().isBoolean()
  ],
  validate,
  machineController.updateMachine
);

// Delete machine
router.delete('/:id',
  hasPermission('machines:delete'),
  [param('id').isUUID().withMessage('Invalid machine ID')],
  validate,
  machineController.deleteMachine
);

module.exports = router;
