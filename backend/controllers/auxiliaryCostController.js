const AuxiliaryCost = require('../models/AuxiliaryCost');

const auxiliaryCostController = {
  // Get all auxiliary costs
  async getAll(req, res) {
    try {
      const auxiliaryCosts = await AuxiliaryCost.getAll();
      res.json(auxiliaryCosts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get auxiliary cost by ID
  async getById(req, res) {
    try {
      const auxiliaryCost = await AuxiliaryCost.getById(req.params.id);
      if (!auxiliaryCost) {
        return res.status(404).json({ error: 'Auxiliary cost not found' });
      }
      res.json(auxiliaryCost);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create auxiliary cost
  async create(req, res) {
    try {
      const auxiliaryCost = await AuxiliaryCost.create(req.body);
      res.status(201).json(auxiliaryCost);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Auxiliary cost type already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Update auxiliary cost
  async update(req, res) {
    try {
      const auxiliaryCost = await AuxiliaryCost.update(req.params.id, req.body);
      if (!auxiliaryCost) {
        return res.status(404).json({ error: 'Auxiliary cost not found' });
      }
      res.json(auxiliaryCost);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Disable auxiliary cost
  async disable(req, res) {
    try {
      const auxiliaryCost = await AuxiliaryCost.disable(req.params.id);
      if (!auxiliaryCost) {
        return res.status(404).json({ error: 'Auxiliary cost not found' });
      }
      res.json(auxiliaryCost);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Enable auxiliary cost
  async enable(req, res) {
    try {
      const auxiliaryCost = await AuxiliaryCost.enable(req.params.id);
      if (!auxiliaryCost) {
        return res.status(404).json({ error: 'Auxiliary cost not found' });
      }
      res.json(auxiliaryCost);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = auxiliaryCostController;
