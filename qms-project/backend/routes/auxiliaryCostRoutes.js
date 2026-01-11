const express = require('express');
const router = express.Router();
const {
  getAuxiliaryCosts,
  getAuxiliaryCost,
  createAuxiliaryCost,
  updateAuxiliaryCost,
  deleteAuxiliaryCost
} = require('../controllers/auxiliaryCostController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getAuxiliaryCosts)
  .post(protect, authorize('admin', 'approver'), createAuxiliaryCost);

router.route('/:id')
  .get(protect, getAuxiliaryCost)
  .put(protect, authorize('admin', 'approver'), updateAuxiliaryCost)
  .delete(protect, authorize('admin', 'approver'), deleteAuxiliaryCost);

module.exports = router;
