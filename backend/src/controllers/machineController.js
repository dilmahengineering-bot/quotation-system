const db = require('../config/database');

// Get all machines
exports.getAllMachines = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;
    
    let query = `
      SELECT machine_id, machine_name, machine_type, hourly_rate, description, is_active, created_at
      FROM machines
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND machine_type = $${paramIndex++}`;
      params.push(type);
    }

    if (status !== undefined) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(status === 'active');
    }

    if (search) {
      query += ` AND (machine_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY machine_type, machine_name ASC';

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

// Get machine types
exports.getMachineTypes = async (req, res, next) => {
  try {
    const types = ['Milling', 'Turning', 'EDM', 'WEDM', 'Grinding', 'Drilling', 'Laser', 'Welding', 'Other'];
    
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    next(error);
  }
};

// Get machine by ID
exports.getMachineById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT * FROM machines WHERE machine_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
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

// Create machine
exports.createMachine = async (req, res, next) => {
  try {
    const { machineName, machineType, hourlyRate, description } = req.body;

    const result = await db.query(
      `INSERT INTO machines (machine_name, machine_type, hourly_rate, description, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [machineName, machineType, hourlyRate, description, req.user.userId]
    );

    res.status(201).json({
      success: true,
      message: 'Machine created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update machine
exports.updateMachine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { machineName, machineType, hourlyRate, description, isActive } = req.body;

    const result = await db.query(
      `UPDATE machines 
       SET machine_name = COALESCE($1, machine_name),
           machine_type = COALESCE($2, machine_type),
           hourly_rate = COALESCE($3, hourly_rate),
           description = COALESCE($4, description),
           is_active = COALESCE($5, is_active),
           updated_by = $6
       WHERE machine_id = $7
       RETURNING *`,
      [machineName, machineType, hourlyRate, description, isActive, req.user.userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    res.json({
      success: true,
      message: 'Machine updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete machine (soft delete)
exports.deleteMachine = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if machine is used in any operations
    const operationsCheck = await db.query(
      'SELECT COUNT(*) FROM part_operations WHERE machine_id = $1',
      [id]
    );

    if (parseInt(operationsCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete machine used in quotations. Disable instead.'
      });
    }

    const result = await db.query(
      `UPDATE machines SET is_active = false, updated_by = $1 WHERE machine_id = $2 RETURNING machine_id`,
      [req.user.userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    res.json({
      success: true,
      message: 'Machine disabled successfully'
    });
  } catch (error) {
    next(error);
  }
};
