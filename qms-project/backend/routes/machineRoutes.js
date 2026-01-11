const express = require('express');
const router = express.Router();
const {
  getMachines,
  getMachine,
  createMachine,
  updateMachine,
  deleteMachine
} = require('../controllers/machineController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getMachines)
  .post(protect, authorize('admin', 'approver'), createMachine);

router.route('/:id')
  .get(protect, getMachine)
  .put(protect, authorize('admin', 'approver'), updateMachine)
  .delete(protect, authorize('admin', 'approver'), deleteMachine);

module.exports = router;
