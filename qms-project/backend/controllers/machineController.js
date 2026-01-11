const { Machine } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all machines
// @route   GET /api/machines
// @access  Private
exports.getMachines = async (req, res) => {
  try {
    const { active_only } = req.query;
    
    const whereClause = {};
    if (active_only === 'true') {
      whereClause.is_active = true;
    }

    const machines = await Machine.findAll({
      where: whereClause,
      order: [['machine_name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: machines.length,
      data: machines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single machine
// @route   GET /api/machines/:id
// @access  Private
exports.getMachine = async (req, res) => {
  try {
    const machine = await Machine.findByPk(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new machine
// @route   POST /api/machines
// @access  Private/Admin,Approver
exports.createMachine = async (req, res) => {
  try {
    const { machine_name, machine_type, hourly_rate, description } = req.body;

    const machine = await Machine.create({
      machine_name,
      machine_type,
      hourly_rate,
      description,
      created_by: req.user.user_id
    });

    res.status(201).json({
      success: true,
      data: machine
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update machine
// @route   PUT /api/machines/:id
// @access  Private/Admin,Approver
exports.updateMachine = async (req, res) => {
  try {
    const machine = await Machine.findByPk(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    const { machine_name, machine_type, hourly_rate, description, is_active } = req.body;

    if (machine_name) machine.machine_name = machine_name;
    if (machine_type) machine.machine_type = machine_type;
    if (hourly_rate !== undefined) machine.hourly_rate = hourly_rate;
    if (description !== undefined) machine.description = description;
    if (typeof is_active !== 'undefined') machine.is_active = is_active;
    
    machine.updated_by = req.user.user_id;

    await machine.save();

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete (disable) machine
// @route   DELETE /api/machines/:id
// @access  Private/Admin,Approver
exports.deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findByPk(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    // Soft delete - set is_active to false
    machine.is_active = false;
    machine.updated_by = req.user.user_id;
    await machine.save();

    res.status(200).json({
      success: true,
      message: 'Machine disabled successfully',
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
