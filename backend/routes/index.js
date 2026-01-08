const express = require('express');
const router = express.Router();

const machineController = require('../controllers/machineController');
const customerController = require('../controllers/customerController');
const auxiliaryCostController = require('../controllers/auxiliaryCostController');
const quotationController = require('../controllers/quotationController');
const exportController = require('../controllers/exportController');

// Machine routes
router.get('/machines', machineController.getAll);
router.get('/machines/:id', machineController.getById);
router.post('/machines', machineController.create);
router.put('/machines/:id', machineController.update);
router.patch('/machines/:id/disable', machineController.disable);
router.patch('/machines/:id/enable', machineController.enable);

// Customer routes
router.get('/customers', customerController.getAll);
router.get('/customers/:id', customerController.getById);
router.post('/customers', customerController.create);
router.put('/customers/:id', customerController.update);
router.patch('/customers/:id/disable', customerController.disable);
router.patch('/customers/:id/enable', customerController.enable);

// Auxiliary cost routes
router.get('/auxiliary-costs', auxiliaryCostController.getAll);
router.get('/auxiliary-costs/:id', auxiliaryCostController.getById);
router.post('/auxiliary-costs', auxiliaryCostController.create);
router.put('/auxiliary-costs/:id', auxiliaryCostController.update);
router.patch('/auxiliary-costs/:id/disable', auxiliaryCostController.disable);
router.patch('/auxiliary-costs/:id/enable', auxiliaryCostController.enable);

// Quotation routes
router.get('/quotations', quotationController.getAll);
router.get('/quotations/:id', quotationController.getById);
router.post('/quotations', quotationController.create);
router.put('/quotations/:id', quotationController.update);
router.patch('/quotations/:id/status', quotationController.updateStatus);
router.delete('/quotations/:id', quotationController.delete);

// Export routes
router.get('/quotations/:id/export/pdf', exportController.exportPDF);
router.get('/quotations/:id/export/excel', exportController.exportExcel);

module.exports = router;
