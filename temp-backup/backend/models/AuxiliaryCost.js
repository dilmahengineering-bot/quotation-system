const pool = require('../config/database');

class AuxiliaryCost {
  // Get all active auxiliary costs
  static async getAll() {
    const query = 'SELECT * FROM auxiliary_costs WHERE is_active = true ORDER BY aux_type';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get auxiliary cost by ID
  static async getById(id) {
    const query = 'SELECT * FROM auxiliary_costs WHERE aux_type_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Create new auxiliary cost
  static async create(data) {
    const { aux_type, description, default_cost } = data;
    const query = `
      INSERT INTO auxiliary_costs (aux_type, description, default_cost)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [aux_type, description, default_cost]);
    return result.rows[0];
  }

  // Update auxiliary cost
  static async update(id, data) {
    const { aux_type, description, default_cost } = data;
    const query = `
      UPDATE auxiliary_costs
      SET aux_type = $1, description = $2, default_cost = $3, updated_at = CURRENT_TIMESTAMP
      WHERE aux_type_id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [aux_type, description, default_cost, id]);
    return result.rows[0];
  }

  // Soft delete (disable) auxiliary cost
  static async disable(id) {
    const query = `
      UPDATE auxiliary_costs
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE aux_type_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Enable auxiliary cost
  static async enable(id) {
    const query = `
      UPDATE auxiliary_costs
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE aux_type_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = AuxiliaryCost;
