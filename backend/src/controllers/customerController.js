const db = require('../config/database');

// Get all customers
exports.getAllCustomers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    
    let query = `
      SELECT customer_id, company_name, address, contact_person_name, email, phone, vat_number, is_active, created_at
      FROM customers
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status !== undefined) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(status === 'active');
    }

    if (search) {
      query += ` AND (company_name ILIKE $${paramIndex} OR contact_person_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY company_name ASC';

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

// Get customer by ID
exports.getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT * FROM customers WHERE customer_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
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

// Create customer
exports.createCustomer = async (req, res, next) => {
  try {
    const { companyName, address, contactPersonName, email, phone, vatNumber } = req.body;

    const result = await db.query(
      `INSERT INTO customers (company_name, address, contact_person_name, email, phone, vat_number, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [companyName, address, contactPersonName, email, phone, vatNumber, req.user.userId]
    );

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update customer
exports.updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyName, address, contactPersonName, email, phone, vatNumber, isActive } = req.body;

    const result = await db.query(
      `UPDATE customers 
       SET company_name = COALESCE($1, company_name),
           address = COALESCE($2, address),
           contact_person_name = COALESCE($3, contact_person_name),
           email = COALESCE($4, email),
           phone = COALESCE($5, phone),
           vat_number = COALESCE($6, vat_number),
           is_active = COALESCE($7, is_active),
           updated_by = $8
       WHERE customer_id = $9
       RETURNING *`,
      [companyName, address, contactPersonName, email, phone, vatNumber, isActive, req.user.userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete customer (soft delete)
exports.deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if customer has quotations
    const quotationsCheck = await db.query(
      'SELECT COUNT(*) FROM quotations WHERE customer_id = $1',
      [id]
    );

    if (parseInt(quotationsCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer with existing quotations. Disable instead.'
      });
    }

    const result = await db.query(
      `UPDATE customers SET is_active = false, updated_by = $1 WHERE customer_id = $2 RETURNING customer_id`,
      [req.user.userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer disabled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get customer quotation history
exports.getCustomerQuotations = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT q.quotation_id, q.quote_number, q.quote_date, q.status, q.total_quote_value, q.currency
       FROM quotations q
       WHERE q.customer_id = $1
       ORDER BY q.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};
