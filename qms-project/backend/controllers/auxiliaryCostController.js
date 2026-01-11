const { AuxiliaryCost } = require('../models');

// @desc    Get all auxiliary costs
// @route   GET /api/auxiliary-costs
// @access  Private
exports.getAuxiliaryCosts = async (req, res) => {
  try {
    const { active_only } = req.query;
    
    const whereClause = {};
    if (active_only === 'true') {
      whereClause.is_active = true;
    }

    const auxiliaryCosts = await AuxiliaryCost.findAll({
      where: whereClause,
      order: [['aux_type', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: auxiliaryCosts.length,
      data: auxiliaryCosts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single auxiliary cost
// @route   GET /api/auxiliary-costs/:id
// @access  Private
exports.getAuxiliaryCost = async (req, res) => {
  try {
    const auxiliaryCost = await AuxiliaryCost.findByPk(req.params.id);

    if (!auxiliaryCost) {
      return res.status(404).json({
        success: false,
        message: 'Auxiliary cost not found'
      });
    }

    res.status(200).json({
      success: true,
      data: auxiliaryCost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new auxiliary cost
// @route   POST /api/auxiliary-costs
// @access  Private/Admin,Approver
exports.createAuxiliaryCost = async (req, res) => {
  try {
    const { aux_type, description, default_cost } = req.body;

    const auxiliaryCost = await AuxiliaryCost.create({
      aux_type,
      description,
      default_cost,
      created_by: req.user.user_id
    });

    res.status(201).json({
      success: true,
      data: auxiliaryCost
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update auxiliary cost
// @route   PUT /api/auxiliary-costs/:id
// @access  Private/Admin,Approver
exports.updateAuxiliaryCost = async (req, res) => {
  try {
    const auxiliaryCost = await AuxiliaryCost.findByPk(req.params.id);

    if (!auxiliaryCost) {
      return res.status(404).json({
        success: false,
        message: 'Auxiliary cost not found'
      });
    }

    const { aux_type, description, default_cost, is_active } = req.body;

    if (aux_type) auxiliaryCost.aux_type = aux_type;
    if (description !== undefined) auxiliaryCost.description = description;
    if (default_cost !== undefined) auxiliaryCost.default_cost = default_cost;
    if (typeof is_active !== 'undefined') auxiliaryCost.is_active = is_active;
    
    auxiliaryCost.updated_by = req.user.user_id;

    await auxiliaryCost.save();

    res.status(200).json({
      success: true,
      data: auxiliaryCost
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete (disable) auxiliary cost
// @route   DELETE /api/auxiliary-costs/:id
// @access  Private/Admin,Approver
exports.deleteAuxiliaryCost = async (req, res) => {
  try {
    const auxiliaryCost = await AuxiliaryCost.findByPk(req.params.id);

    if (!auxiliaryCost) {
      return res.status(404).json({
        success: false,
        message: 'Auxiliary cost not found'
      });
    }

    // Soft delete
    auxiliaryCost.is_active = false;
    auxiliaryCost.updated_by = req.user.user_id;
    await auxiliaryCost.save();

    res.status(200).json({
      success: true,
      message: 'Auxiliary cost disabled successfully',
      data: auxiliaryCost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
