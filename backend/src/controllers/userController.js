const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    
    let query = `
      SELECT user_id, full_name, username, role, email, phone, is_active, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (role) {
      query += ` AND role = $${paramIndex++}`;
      params.push(role);
    }

    if (status !== undefined) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(status === 'active');
    }

    if (search) {
      query += ` AND (full_name ILIKE $${paramIndex} OR username ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

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

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT user_id, full_name, username, role, email, phone, is_active, created_at, updated_at
       FROM users WHERE user_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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

// Create user
exports.createUser = async (req, res, next) => {
  try {
    const { fullName, username, password, role, email, phone } = req.body;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO users (full_name, username, password_hash, role, email, phone, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id, full_name, username, role, email, phone, is_active, created_at`,
      [fullName, username, passwordHash, role, email, phone, req.user.userId]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, role, email, phone, isActive } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           role = COALESCE($2, role),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           is_active = COALESCE($5, is_active),
           updated_by = $6
       WHERE user_id = $7
       RETURNING user_id, full_name, username, role, email, phone, is_active, updated_at`,
      [fullName, role, email, phone, isActive, req.user.userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Reset user password (Admin only)
exports.resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const result = await db.query(
      `UPDATE users SET password_hash = $1, updated_by = $2 WHERE user_id = $3 RETURNING user_id`,
      [passwordHash, req.user.userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (soft delete - disable)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const result = await db.query(
      `UPDATE users SET is_active = false, updated_by = $1 WHERE user_id = $2 RETURNING user_id`,
      [req.user.userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User disabled successfully'
    });
  } catch (error) {
    next(error);
  }
};
