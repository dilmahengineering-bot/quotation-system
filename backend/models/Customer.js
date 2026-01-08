const pool = require('../config/database');

class Customer {
  // Get all active customers
  static async getAll() {
    const query = 'SELECT * FROM customers WHERE is_active = true ORDER BY company_name';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get customer by ID
  static async getById(id) {
    const query = 'SELECT * FROM customers WHERE customer_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Create new customer
  static async create(data) {
    const { company_name, address, contact_person_name, email, phone, vat_number } = data;
    const query = `
      INSERT INTO customers (company_name, address, contact_person_name, email, phone, vat_number)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [
      company_name,
      address,
      contact_person_name,
      email,
      phone,
      vat_number
    ]);
    return result.rows[0];
  }

  // Update customer
  static async update(id, data) {
    const { company_name, address, contact_person_name, email, phone, vat_number } = data;
    const query = `
      UPDATE customers
      SET company_name = $1, address = $2, contact_person_name = $3,
          email = $4, phone = $5, vat_number = $6, updated_at = CURRENT_TIMESTAMP
      WHERE customer_id = $7
      RETURNING *
    `;
    const result = await pool.query(query, [
      company_name,
      address,
      contact_person_name,
      email,
      phone,
      vat_number,
      id
    ]);
    return result.rows[0];
  }

  // Soft delete (disable) customer
  static async disable(id) {
    const query = `
      UPDATE customers
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE customer_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Enable customer
  static async enable(id) {
    const query = `
      UPDATE customers
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE customer_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Customer;
