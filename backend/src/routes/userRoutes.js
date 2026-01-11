const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticateToken, hasPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authenticateToken);

// Get all users
router.get('/', hasPermission('users:read'), userController.getAllUsers);

// Get user by ID
router.get('/:id',
  hasPermission('users:read'),
  [param('id').isUUID().withMessage('Invalid user ID')],
  validate,
  userController.getUserById
);

// Create user
router.post('/',
  hasPermission('users:create'),
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role')
      .isIn(['Admin', 'Sales', 'Technician', 'Engineer', 'Management'])
      .withMessage('Invalid role'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim()
  ],
  validate,
  userController.createUser
);

// Update user
router.put('/:id',
  hasPermission('users:update'),
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('fullName').optional().trim().notEmpty(),
    body('role').optional().isIn(['Admin', 'Sales', 'Technician', 'Engineer', 'Management']),
    body('email').optional().isEmail(),
    body('phone').optional().trim(),
    body('isActive').optional().isBoolean()
  ],
  validate,
  userController.updateUser
);

// Reset user password
router.post('/:id/reset-password',
  hasPermission('users:update'),
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  validate,
  userController.resetPassword
);

// Delete (disable) user
router.delete('/:id',
  hasPermission('users:delete'),
  [param('id').isUUID().withMessage('Invalid user ID')],
  validate,
  userController.deleteUser
);

module.exports = router;
