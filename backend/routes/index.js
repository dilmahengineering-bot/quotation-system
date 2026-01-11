const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const machineController = require('../controllers/machineController');
const customerController = require('../controllers/customerController');
const auxiliaryCostController = require('../controllers/auxiliaryCostController');
const quotationController = require('../controllers/quotationController');
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes - No authentication required
// Authentication routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);

// Protected routes - Authentication required
// Get current user info
router.get('/auth/me', authMiddleware.verifyToken, authController.getCurrentUser);
router.post('/auth/change-password', authMiddleware.verifyToken, authController.changePassword);
router.post('/auth/logout', authMiddleware.verifyToken, authController.logout);

// User management routes (admin only)
router.get('/users', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getAll);
router.get('/users/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getById);
router.post('/users', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.create);
router.put('/users/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.update);
router.patch('/users/:id/disable', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.disable);
router.patch('/users/:id/enable', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.enable);
router.post('/users/:id/reset-password', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.resetPassword);

// Machine routes (authentication required)
router.get('/machines', authMiddleware.verifyToken, machineController.getAll);
router.get('/machines/:id', authMiddleware.verifyToken, machineController.getById);
router.post('/machines', authMiddleware.verifyToken, machineController.create);
router.put('/machines/:id', authMiddleware.verifyToken, machineController.update);
router.patch('/machines/:id/disable', authMiddleware.verifyToken, machineController.disable);
router.patch('/machines/:id/enable', authMiddleware.verifyToken, machineController.enable);

// Customer routes (authentication required)
router.get('/customers', authMiddleware.verifyToken, customerController.getAll);
router.get('/customers/:id', authMiddleware.verifyToken, customerController.getById);
router.post('/customers', authMiddleware.verifyToken, customerController.create);
router.put('/customers/:id', authMiddleware.verifyToken, customerController.update);
router.patch('/customers/:id/disable', authMiddleware.verifyToken, customerController.disable);
router.patch('/customers/:id/enable', authMiddleware.verifyToken, customerController.enable);

// Auxiliary cost routes (authentication required)
router.get('/auxiliary-costs', authMiddleware.verifyToken, auxiliaryCostController.getAll);
router.get('/auxiliary-costs/:id', authMiddleware.verifyToken, auxiliaryCostController.getById);
router.post('/auxiliary-costs', authMiddleware.verifyToken, auxiliaryCostController.create);
router.put('/auxiliary-costs/:id', authMiddleware.verifyToken, auxiliaryCostController.update);
router.patch('/auxiliary-costs/:id/disable', authMiddleware.verifyToken, auxiliaryCostController.disable);
router.patch('/auxiliary-costs/:id/enable', authMiddleware.verifyToken, auxiliaryCostController.enable);

// Quotation routes (authentication required)
router.get('/quotations/statistics', authMiddleware.verifyToken, quotationController.getStatistics);
router.get('/quotations', authMiddleware.verifyToken, quotationController.getAll);
router.get('/quotations/:id', authMiddleware.verifyToken, quotationController.getById);
router.post('/quotations', authMiddleware.verifyToken, quotationController.create);
router.put('/quotations/:id', authMiddleware.verifyToken, quotationController.update);
router.patch('/quotations/:id/status', authMiddleware.verifyToken, quotationController.updateStatus);
router.delete('/quotations/:id', authMiddleware.verifyToken, quotationController.delete);

// Quotation workflow routes
router.post('/quotations/:id/submit', authMiddleware.verifyToken, quotationController.submit);
router.post('/quotations/:id/engineer-approve', authMiddleware.verifyToken, quotationController.engineerApprove);
router.post('/quotations/:id/management-approve', authMiddleware.verifyToken, quotationController.managementApprove);
router.post('/quotations/:id/reject', authMiddleware.verifyToken, quotationController.reject);
router.post('/quotations/:id/issue', authMiddleware.verifyToken, quotationController.issue);
router.post('/quotations/:id/revert-draft', authMiddleware.verifyToken, quotationController.revertToDraft);

// Export routes (authentication required)
router.get('/quotations/:id/export/pdf', authMiddleware.verifyToken, exportController.exportPDF);
router.get('/quotations/:id/export/excel', authMiddleware.verifyToken, exportController.exportExcel);

module.exports = router;
