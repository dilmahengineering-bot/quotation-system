const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Password validation helper
  static validatePassword(password) {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasLetter) {
      errors.push('Password must contain at least one letter');
    }
    if (!hasNumber) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get all active users
  static async getAll() {
    const query = 'SELECT user_id, username, full_name, email, role, is_active, last_login, require_password_change, password_changed_at, created_at FROM users WHERE is_active = true ORDER BY full_name';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get user by ID
  static async getById(id) {
    const query = 'SELECT user_id, username, full_name, email, role, is_active, last_login, require_password_change, password_changed_at, created_at FROM users WHERE user_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get user by username (for login)
  static async getByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1 AND is_active = true';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  // Get user by email
  static async getByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Create new user
  static async create(data) {
    const { username, password, full_name, email, role = 'user' } = data;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (username, password_hash, full_name, email, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, username, full_name, email, role, is_active, created_at
    `;
    const result = await pool.query(query, [username, password_hash, full_name, email, role]);
    return result.rows[0];
  }

  // Update user
  static async update(id, data) {
    const { full_name, email, role } = data;
    const query = `
      UPDATE users
      SET full_name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $4
      RETURNING user_id, username, full_name, email, role, is_active, created_at
    `;
    const result = await pool.query(query, [full_name, email, role, id]);
    return result.rows[0];
  }

  // Change password
  static async changePassword(id, newPassword, requireChange = false) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    const query = `
      UPDATE users
      SET password_hash = $1, 
          updated_at = CURRENT_TIMESTAMP,
          password_changed_at = CURRENT_TIMESTAMP,
          require_password_change = $3
      WHERE user_id = $2
      RETURNING user_id, username, full_name, email, require_password_change
    `;
    const result = await pool.query(query, [password_hash, id, requireChange]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update last login
  static async updateLastLogin(id) {
    const query = `
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `;
    await pool.query(query, [id]);
  }

  // Disable user
  static async disable(id) {
    const query = `
      UPDATE users
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING user_id, username, full_name, email, role, is_active
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Enable user
  static async enable(id) {
    const query = `
      UPDATE users
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING user_id, username, full_name, email, role, is_active
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = User;
