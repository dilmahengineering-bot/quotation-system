const Customer = require('../models/Customer');

const customerController = {
  // Get all customers
  async getAll(req, res) {
    try {
      const customers = await Customer.getAll();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get customer by ID
  async getById(req, res) {
    try {
      const customer = await Customer.getById(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create customer
  async create(req, res) {
    try {
      const customer = await Customer.create(req.body);
      res.status(201).json(customer);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Customer with this company name and email already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Update customer
  async update(req, res) {
    try {
      const customer = await Customer.update(req.params.id, req.body);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Disable customer
  async disable(req, res) {
    try {
      const customer = await Customer.disable(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Enable customer
  async enable(req, res) {
    try {
      const customer = await Customer.enable(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = customerController;
