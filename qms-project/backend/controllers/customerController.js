const { Customer } = require('../models');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
  try {
    const { active_only } = req.query;
    
    const whereClause = {};
    if (active_only === 'true') {
      whereClause.is_active = true;
    }

    const customers = await Customer.findAll({
      where: whereClause,
      order: [['company_name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res) => {
  try {
    const { company_name, address, contact_person_name, email, phone, vat_number } = req.body;

    const customer = await Customer.create({
      company_name,
      address,
      contact_person_name,
      email,
      phone,
      vat_number,
      created_by: req.user.user_id
    });

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const { company_name, address, contact_person_name, email, phone, vat_number, is_active } = req.body;

    if (company_name) customer.company_name = company_name;
    if (address !== undefined) customer.address = address;
    if (contact_person_name) customer.contact_person_name = contact_person_name;
    if (email) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (vat_number !== undefined) customer.vat_number = vat_number;
    if (typeof is_active !== 'undefined') customer.is_active = is_active;
    
    customer.updated_by = req.user.user_id;

    await customer.save();

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete (disable) customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Soft delete
    customer.is_active = false;
    customer.updated_by = req.user.user_id;
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer disabled successfully',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
