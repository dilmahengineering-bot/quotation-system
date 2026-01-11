const db = require('../config/database');

// Get all auxiliary costs
exports.getAllAuxiliaryCosts = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    
    let query = `
      SELECT aux_type_id, aux_type, description, default_cost, is_active, created_at
      FROM auxiliary_costs
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status !== undefined) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(status === 'active');
    }

    if (search) {
      query += ` AND (aux_type ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY aux_type ASC';

    const result = await db.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get auxiliary cost by ID
exports.getAuxiliaryCostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT * FROM auxiliary_costs WHERE aux_type_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Auxiliary cost type not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Create auxiliary cost
exports.createAuxiliaryCost = async (req, res, next) => {
  try {
    const { auxType, description, defaultCost } = req.body;

    const result = await db.query(
      `INSERT INTO auxiliary_costs (aux_type, description, default_cost, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [auxType, description, defaultCost || 0, req.user.userId]
    );

    res.status(201).json({
      success: true,
      message: 'Auxiliary cost type created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update auxiliary cost
exports.updateAuxiliaryCost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { auxType, description, defaultCost, isActive } = req.body;

    const result = await db.query(
      `UPDATE auxiliary_costs 
       SET aux_type = COALESCE($1, aux_type),
           description = COALESCE($2, description),
           default_cost = COALESCE($3, default_cost),
           is_active = COALESCE($4, is_active),
           updated_by = $5
       WHERE aux_type_id = $6
       RETURNING *`,
      [auxType, description, defaultCost, isActive, req.user.userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Auxiliary cost type not found'
      });
    }

    res.json({
      success: true,
      message: 'Auxiliary cost type updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete auxiliary cost (soft delete)
exports.deleteAuxiliaryCost = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if used in any part costs
    const usageCheck = await db.query(
      'SELECT COUNT(*) FROM part_auxiliary_costs WHERE aux_type_id = $1',
      [id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete auxiliary cost type used in quotations. Disable instead.'
      });
    }

    const result = await db.query(
      `UPDATE auxiliary_costs SET is_active = false, updated_by = $1 WHERE aux_type_id = $2 RETURNING aux_type_id`,
      [req.user.userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Auxiliary cost type not found'
      });
    }

    res.json({
      success: true,
      message: 'Auxiliary cost type disabled successfully'
    });
  } catch (error) {
    next(error);
  }
};
