const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const quotationController = require('../controllers/quotationController');
const partsController = require('../controllers/partsController');
const workflowController = require('../controllers/workflowController');
const { authenticateToken, hasPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authenticateToken);

// Statistics
router.get('/statistics', hasPermission('quotations:read'), workflowController.getStatistics);

// Get all quotations
router.get('/', hasPermission('quotations:read'), quotationController.getAllQuotations);

// Get quotation by ID
router.get('/:id',
  hasPermission('quotations:read'),
  [param('id').isUUID().withMessage('Invalid quotation ID')],
  validate,
  quotationController.getQuotationById
);

// Create quotation
router.post('/',
  hasPermission('quotations:create'),
  [
    body('customerId').isUUID().withMessage('Valid customer ID is required'),
    body('quoteDate').optional().isISO8601(),
    body('leadTime').optional().trim(),
    body('paymentTerms').optional().trim(),
    body('currency').optional().isIn(['USD', 'LKR']),
    body('shipmentType').optional().trim(),
    body('marginPercent').optional().isFloat({ min: 0, max: 100 }),
    body('discountPercent').optional().isFloat({ min: 0, max: 100 }),
    body('vatPercent').optional().isFloat({ min: 0, max: 100 }),
    body('notes').optional().trim(),
    body('validUntil').optional().isISO8601()
  ],
  validate,
  quotationController.createQuotation
);

// Update quotation header
router.put('/:id',
  hasPermission('quotations:update'),
  [
    param('id').isUUID().withMessage('Invalid quotation ID'),
    body('customerId').optional().isUUID(),
    body('quoteDate').optional().isISO8601(),
    body('leadTime').optional().trim(),
    body('paymentTerms').optional().trim(),
    body('currency').optional().isIn(['USD', 'LKR']),
    body('shipmentType').optional().trim(),
    body('marginPercent').optional().isFloat({ min: 0, max: 100 }),
    body('discountPercent').optional().isFloat({ min: 0, max: 100 }),
    body('vatPercent').optional().isFloat({ min: 0, max: 100 }),
    body('notes').optional().trim(),
    body('validUntil').optional().isISO8601()
  ],
  validate,
  quotationController.updateQuotation
);

// Delete quotation
router.delete('/:id',
  hasPermission('quotations:delete'),
  [param('id').isUUID().withMessage('Invalid quotation ID')],
  validate,
  workflowController.deleteQuotation
);

// ==================== WORKFLOW ROUTES ====================

// Submit for approval
router.post('/:id/submit',
  hasPermission('quotations:submit'),
  [param('id').isUUID().withMessage('Invalid quotation ID')],
  validate,
  workflowController.submitQuotation
);

// Engineer approve
router.post('/:id/engineer-approve',
  hasPermission('quotations:engineer_approve'),
  [param('id').isUUID().withMessage('Invalid quotation ID')],
  validate,
  workflowController.engineerApprove
);

// Management approve
router.post('/:id/management-approve',
  hasPermission('quotations:management_approve'),
  [param('id').isUUID().withMessage('Invalid quotation ID')],
  validate,
  workflowController.managementApprove
);

// Reject
router.post('/:id/reject',
  hasPermission('quotations:reject'),
  [
    param('id').isUUID().withMessage('Invalid quotation ID'),
    body('comments').notEmpty().withMessage('Rejection reason is required')
  ],
  validate,
  workflowController.rejectQuotation
);

// Issue
router.post('/:id/issue',
  hasPermission('quotations:issue'),
  [param('id').isUUID().withMessage('Invalid quotation ID')],
  validate,
  workflowController.issueQuotation
);

// Revert to draft
router.post('/:id/revert-draft',
  hasPermission('quotations:update'),
  [param('id').isUUID().withMessage('Invalid quotation ID')],
  validate,
  workflowController.revertToDraft
);

// ==================== PARTS ROUTES ====================

// Add part
router.post('/:quotationId/parts',
  hasPermission('quotations:update'),
  [
    param('quotationId').isUUID().withMessage('Invalid quotation ID'),
    body('partNumber').trim().notEmpty().withMessage('Part number is required'),
    body('partDescription').optional().trim(),
    body('unitMaterialCost').optional().isFloat({ min: 0 }),
    body('quantity').optional().isInt({ min: 1 })
  ],
  validate,
  partsController.addPart
);

// Update part
router.put('/:quotationId/parts/:partId',
  hasPermission('quotations:update'),
  [
    param('quotationId').isUUID().withMessage('Invalid quotation ID'),
    param('partId').isUUID().withMessage('Invalid part ID'),
    body('partNumber').optional().trim().notEmpty(),
    body('partDescription').optional().trim(),
    body('unitMaterialCost').optional().isFloat({ min: 0 }),
    body('quantity').optional().isInt({ min: 1 })
  ],
  validate,
  partsController.updatePart
);

// Delete part
router.delete('/:quotationId/parts/:partId',
  hasPermission('quotations:update'),
  [
    param('quotationId').isUUID().withMessage('Invalid quotation ID'),
    param('partId').isUUID().withMessage('Invalid part ID')
  ],
  validate,
  partsController.deletePart
);

// ==================== OPERATIONS ROUTES ====================

// Add operation
router.post('/:quotationId/parts/:partId/operations',
  hasPermission('quotations:update'),
  [
    param('quotationId').isUUID().withMessage('Invalid quotation ID'),
    param('partId').isUUID().withMessage('Invalid part ID'),
    body('machineId').isUUID().withMessage('Valid machine ID is required'),
    body('operationName').optional().trim(),
    body('estimatedTimeHours').optional().isFloat({ min: 0 }),
    body('hourlyRate').optional().isFloat({ min: 0 }),
    body('notes').optional().trim()
  ],
  validate,
  partsController.addOperation
);

// Update operation
router.put('/:quotationId/parts/:partId/operations/:operationId',
  hasPermission('quotations:update'),
  [
    param('quotationId').isUUID().withMessage('Invalid quotation ID'),
    param('partId').isUUID().withMessage('Invalid part ID'),
    param('operationId').isUUID().withMessage('Invalid operation ID'),
    body('machineId').optional().isUUID(),
    body('operationName').optional().trim(),
    body('estimatedTimeHours').optional().isFloat({ min: 0 }),
    body('hourlyRate').optional().isFloat({ min: 0 }),
    body('notes').optional().trim()
  ],
  validate,
  partsController.updateOperation
);

// Delete operation
router.delete('/:quotationId/parts/:partId/operations/:operationId',
  hasPermission('quotations:update'),
  [
    param('quotationId').isUUID().withMessage('Invalid quotation ID'),
    param('partId').isUUID().withMessage('Invalid part ID'),
    param('operationId').isUUID().withMessage('Invalid operation ID')
  ],
  validate,
  partsController.deleteOperation
);

// ==================== AUXILIARY COSTS ROUTES ====================

// Add auxiliary cost to part
router.post('/:quotationId/parts/:partId/auxiliary-costs',
  hasPermission('quotations:update'),
  [
    param('quotationId').isUUID().withMessage('Invalid quotation ID'),
    param('partId').isUUID().withMessage('Invalid part ID'),
    body('auxTypeId').isUUID().withMessage('Valid auxiliary type ID is required'),
    body('cost').optional().isFloat({ min: 0 }),
    body('notes').optional().trim()
  ],
  validate,
  partsController.addAuxiliaryCost
);

// Update auxiliary cost
router.put('/:quotationId/parts/:partId/auxiliary-costs/:auxCostId',
  hasPermission('quotations:update'),
  [
    param('quotationId').isUUID().withMessage('Invalid quotation ID'),
    param('partId').isUUID().withMessage('Invalid part ID'),
    param('auxCostId').isUUID().withMessage('Invalid auxiliary cost ID'),
    body('cost').optional().isFloat({ min: 0 }),
    body('notes').optional().trim()
  ],
  validate,
  partsController.updateAuxiliaryCost
);

// Delete auxiliary cost
router.delete('/:quotationId/parts/:partId/auxiliary-costs/:auxCostId',
  hasPermission('quotations:update'),
  [
    param('quotationId').isUUID().withMessage('Invalid quotation ID'),
    param('partId').isUUID().withMessage('Invalid part ID'),
    param('auxCostId').isUUID().withMessage('Invalid auxiliary cost ID')
  ],
  validate,
  partsController.deleteAuxiliaryCost
);

module.exports = router;
