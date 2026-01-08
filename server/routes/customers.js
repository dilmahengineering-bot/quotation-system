const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// Validation middleware
const validateCustomer = [
  body('company_name').trim().notEmpty().withMessage('Company name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('contact_person_name').optional().trim(),
  body('vat_number').optional().trim()
];

// GET all customers
router.get('/', async (req, res) => {
  try {
    const { active_only, search } = req.query;
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    
    if (active_only === 'true') {
      query += ' AND is_active = true';
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (company_name ILIKE $${params.length} OR contact_person_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }
    
    query += ' ORDER BY company_name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single customer
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM customers WHERE customer_id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create customer
router.post('/', validateCustomer, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { company_name, address, contact_person_name, email, phone, vat_number } = req.body;
    
    // Check for duplicate
    const existingCustomer = await pool.query(
      'SELECT * FROM customers WHERE company_name = $1 AND email = $2',
      [company_name, email]
    );
    
    if (existingCustomer.rows.length > 0) {
      return res.status(400).json({ error: 'Customer with this company name and email already exists' });
    }
    
    const result = await pool.query(
      `INSERT INTO customers (company_name, address, contact_person_name, email, phone, vat_number) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [company_name, address, contact_person_name, email, phone, vat_number]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Customer with this company name and email already exists' });
    }
    console.error('Error creating customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update customer
router.put('/:id', validateCustomer, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { company_name, address, contact_person_name, email, phone, vat_number } = req.body;
    
    // Check for duplicate (excluding current customer)
    const existingCustomer = await pool.query(
      'SELECT * FROM customers WHERE company_name = $1 AND email = $2 AND customer_id != $3',
      [company_name, email, id]
    );
    
    if (existingCustomer.rows.length > 0) {
      return res.status(400).json({ error: 'Another customer with this company name and email already exists' });
    }
    
    const result = await pool.query(
      `UPDATE customers 
       SET company_name = $1, address = $2, contact_person_name = $3, email = $4, phone = $5, vat_number = $6
       WHERE customer_id = $7 
       RETURNING *`,
      [company_name, address, contact_person_name, email, phone, vat_number, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH toggle customer active status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE customers 
       SET is_active = NOT is_active 
       WHERE customer_id = $1 
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error toggling customer status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE customer (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE customers SET is_active = false WHERE customer_id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({ message: 'Customer disabled successfully', customer: result.rows[0] });
  } catch (err) {
    console.error('Error disabling customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
