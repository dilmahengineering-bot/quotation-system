const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// Validation middleware
const validateMachine = [
  body('machine_name').trim().notEmpty().withMessage('Machine name is required'),
  body('machine_type').isIn(['Milling', 'Turning', 'EDM', 'WEDM', 'Grinding', 'Drilling', 'Laser', 'Other'])
    .withMessage('Invalid machine type'),
  body('hourly_rate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
];

// GET all machines
router.get('/', async (req, res) => {
  try {
    const { active_only } = req.query;
    let query = 'SELECT * FROM machines';
    if (active_only === 'true') {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY machine_name';
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching machines:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single machine
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM machines WHERE machine_id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching machine:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create machine
router.post('/', validateMachine, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { machine_name, machine_type, hourly_rate } = req.body;
    
    const result = await pool.query(
      `INSERT INTO machines (machine_name, machine_type, hourly_rate) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [machine_name, machine_type, hourly_rate]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating machine:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update machine
router.put('/:id', validateMachine, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { machine_name, machine_type, hourly_rate } = req.body;
    
    const result = await pool.query(
      `UPDATE machines 
       SET machine_name = $1, machine_type = $2, hourly_rate = $3
       WHERE machine_id = $4 
       RETURNING *`,
      [machine_name, machine_type, hourly_rate, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating machine:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH toggle machine active status (disable/enable)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE machines 
       SET is_active = NOT is_active 
       WHERE machine_id = $1 
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error toggling machine status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE machine (soft delete by disabling)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE machines SET is_active = false WHERE machine_id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    
    res.json({ message: 'Machine disabled successfully', machine: result.rows[0] });
  } catch (err) {
    console.error('Error disabling machine:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
