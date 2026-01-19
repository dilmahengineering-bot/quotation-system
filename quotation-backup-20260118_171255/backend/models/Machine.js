const pool = require('../config/database');

class Machine {
  // Get all active machines
  static async getAll() {
    const query = 'SELECT * FROM machines WHERE is_active = true ORDER BY machine_name';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get machine by ID
  static async getById(id) {
    const query = 'SELECT * FROM machines WHERE machine_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Create new machine
  static async create(data) {
    const { machine_name, machine_type, hourly_rate } = data;
    const query = `
      INSERT INTO machines (machine_name, machine_type, hourly_rate)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [machine_name, machine_type, hourly_rate]);
    return result.rows[0];
  }

  // Update machine
  static async update(id, data) {
    const { machine_name, machine_type, hourly_rate } = data;
    const query = `
      UPDATE machines
      SET machine_name = $1, machine_type = $2, hourly_rate = $3, updated_at = CURRENT_TIMESTAMP
      WHERE machine_id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [machine_name, machine_type, hourly_rate, id]);
    return result.rows[0];
  }

  // Soft delete (disable) machine
  static async disable(id) {
    const query = `
      UPDATE machines
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE machine_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Enable machine
  static async enable(id) {
    const query = `
      UPDATE machines
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE machine_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Machine;
