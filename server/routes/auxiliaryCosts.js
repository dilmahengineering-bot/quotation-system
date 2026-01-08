const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// Validation middleware
const validateAuxCost = [
  body('aux_type').trim().notEmpty().withMessage('Auxiliary type is required'),
  body('description').optional().trim(),
  body('default_cost').isFloat({ min: 0 }).withMessage('Default cost must be a positive number')
];

// GET all auxiliary costs
router.get('/', async (req, res) => {
  try {
    const { active_only } = req.query;
    let query = 'SELECT * FROM auxiliary_costs';
    if (active_only === 'true') {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY aux_type';
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching auxiliary costs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single auxiliary cost
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM auxiliary_costs WHERE aux_type_id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Auxiliary cost not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching auxiliary cost:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create auxiliary cost
router.post('/', validateAuxCost, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { aux_type, description, default_cost } = req.body;
    
    const result = await pool.query(
      `INSERT INTO auxiliary_costs (aux_type, description, default_cost) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [aux_type, description, default_cost]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating auxiliary cost:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update auxiliary cost
router.put('/:id', validateAuxCost, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { aux_type, description, default_cost } = req.body;
    
    const result = await pool.query(
      `UPDATE auxiliary_costs 
       SET aux_type = $1, description = $2, default_cost = $3
       WHERE aux_type_id = $4 
       RETURNING *`,
      [aux_type, description, default_cost, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Auxiliary cost not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating auxiliary cost:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH toggle auxiliary cost active status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE auxiliary_costs 
       SET is_active = NOT is_active 
       WHERE aux_type_id = $1 
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Auxiliary cost not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error toggling auxiliary cost status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE auxiliary cost (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE auxiliary_costs SET is_active = false WHERE aux_type_id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Auxiliary cost not found' });
    }
    
    res.json({ message: 'Auxiliary cost disabled successfully', auxiliary_cost: result.rows[0] });
  } catch (err) {
    console.error('Error disabling auxiliary cost:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
