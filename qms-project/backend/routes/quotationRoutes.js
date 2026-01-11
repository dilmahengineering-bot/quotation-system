const express = require('express');
const router = express.Router();
const {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  submitQuotation,
  approveQuotation,
  deleteQuotation
} = require('../controllers/quotationController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getQuotations)
  .post(protect, createQuotation);

router.route('/:id')
  .get(protect, getQuotation)
  .put(protect, updateQuotation)
  .delete(protect, authorize('admin'), deleteQuotation);

router.put('/:id/submit', protect, submitQuotation);
router.put('/:id/approve', protect, authorize('admin', 'approver'), approveQuotation);

module.exports = router;
