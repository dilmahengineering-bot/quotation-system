const Machine = require('../models/Machine');

const machineController = {
  // Get all machines
  async getAll(req, res) {
    try {
      const machines = await Machine.getAll();
      res.json(machines);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get machine by ID
  async getById(req, res) {
    try {
      const machine = await Machine.getById(req.params.id);
      if (!machine) {
        return res.status(404).json({ error: 'Machine not found' });
      }
      res.json(machine);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create machine
  async create(req, res) {
    try {
      const machine = await Machine.create(req.body);
      res.status(201).json(machine);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Machine name already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Update machine
  async update(req, res) {
    try {
      const machine = await Machine.update(req.params.id, req.body);
      if (!machine) {
        return res.status(404).json({ error: 'Machine not found' });
      }
      res.json(machine);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Disable machine
  async disable(req, res) {
    try {
      const machine = await Machine.disable(req.params.id);
      if (!machine) {
        return res.status(404).json({ error: 'Machine not found' });
      }
      res.json(machine);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Enable machine
  async enable(req, res) {
    try {
      const machine = await Machine.enable(req.params.id);
      if (!machine) {
        return res.status(404).json({ error: 'Machine not found' });
      }
      res.json(machine);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = machineController;
