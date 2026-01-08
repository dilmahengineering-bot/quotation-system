const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// Validation middleware
const validateQuotation = [
  body('customer_id').isInt({ min: 1 }).withMessage('Valid customer is required'),
  body('margin_percent').optional().isFloat({ min: 0, max: 100 }).withMessage('Margin must be between 0 and 100'),
  body('notes').optional().trim(),
  body('valid_until').optional().isISO8601().withMessage('Valid date required')
];

// Helper function to recalculate quotation totals
const recalculateQuotation = async (quotationId, client) => {
  const db = client || pool;
  
  // Get all parts with their costs
  const partsResult = await db.query(
    `SELECT 
      part_id, 
      unit_material_cost, 
      unit_operations_cost, 
      unit_auxiliary_cost, 
      quantity 
     FROM quotation_parts 
     WHERE quotation_id = $1`,
    [quotationId]
  );
  
  let totalPartsCost = 0;
  let totalOperationsCost = 0;
  let totalAuxiliaryCost = 0;
  
  for (const part of partsResult.rows) {
    const partSubtotal = (
      parseFloat(part.unit_material_cost) + 
      parseFloat(part.unit_operations_cost) + 
      parseFloat(part.unit_auxiliary_cost)
    ) * parseInt(part.quantity);
    
    totalPartsCost += parseFloat(part.unit_material_cost) * parseInt(part.quantity);
    totalOperationsCost += parseFloat(part.unit_operations_cost) * parseInt(part.quantity);
    totalAuxiliaryCost += parseFloat(part.unit_auxiliary_cost) * parseInt(part.quantity);
    
    // Update part subtotal
    await db.query(
      'UPDATE quotation_parts SET part_subtotal = $1 WHERE part_id = $2',
      [partSubtotal, part.part_id]
    );
  }
  
  // Get current margin
  const quotationResult = await db.query(
    'SELECT margin_percent FROM quotations WHERE quotation_id = $1',
    [quotationId]
  );
  
  const marginPercent = parseFloat(quotationResult.rows[0].margin_percent) || 0;
  const subtotal = totalPartsCost + totalOperationsCost + totalAuxiliaryCost;
  const marginAmount = subtotal * (marginPercent / 100);
  const totalQuoteValue = subtotal + marginAmount;
  
  // Update quotation totals
  await db.query(
    `UPDATE quotations SET 
      total_parts_cost = $1,
      total_auxiliary_cost = $2,
      subtotal = $3,
      margin_amount = $4,
      total_quote_value = $5
     WHERE quotation_id = $6`,
    [totalPartsCost + totalOperationsCost, totalAuxiliaryCost, subtotal, marginAmount, totalQuoteValue, quotationId]
  );
  
  return { totalPartsCost, totalOperationsCost, totalAuxiliaryCost, subtotal, marginAmount, totalQuoteValue };
};

// Helper function to recalculate part costs
const recalculatePartCosts = async (partId, client) => {
  const db = client || pool;
  
  // Calculate operations cost
  const opsResult = await db.query(
    `SELECT SUM(operation_cost) as total_ops_cost 
     FROM part_operations 
     WHERE part_id = $1`,
    [partId]
  );
  const unitOperationsCost = parseFloat(opsResult.rows[0].total_ops_cost) || 0;
  
  // Calculate auxiliary cost
  const auxResult = await db.query(
    `SELECT SUM(cost) as total_aux_cost 
     FROM part_auxiliary_costs 
     WHERE part_id = $1`,
    [partId]
  );
  const unitAuxiliaryCost = parseFloat(auxResult.rows[0].total_aux_cost) || 0;
  
  // Update part
  await db.query(
    `UPDATE quotation_parts 
     SET unit_operations_cost = $1, unit_auxiliary_cost = $2 
     WHERE part_id = $3`,
    [unitOperationsCost, unitAuxiliaryCost, partId]
  );
  
  // Get quotation_id for the part
  const partResult = await db.query(
    'SELECT quotation_id FROM quotation_parts WHERE part_id = $1',
    [partId]
  );
  
  if (partResult.rows.length > 0) {
    await recalculateQuotation(partResult.rows[0].quotation_id, db);
  }
  
  return { unitOperationsCost, unitAuxiliaryCost };
};

// GET all quotations
router.get('/', async (req, res) => {
  try {
    const { status, customer_id } = req.query;
    let query = `
      SELECT q.*, c.company_name, c.contact_person_name, c.email as customer_email
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.customer_id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      params.push(status);
      query += ` AND q.status = $${params.length}`;
    }
    
    if (customer_id) {
      params.push(customer_id);
      query += ` AND q.customer_id = $${params.length}`;
    }
    
    query += ' ORDER BY q.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching quotations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single quotation with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get quotation header
    const quotationResult = await pool.query(
      `SELECT q.*, c.company_name, c.contact_person_name, c.email as customer_email,
              c.address, c.phone, c.vat_number
       FROM quotations q
       LEFT JOIN customers c ON q.customer_id = c.customer_id
       WHERE q.quotation_id = $1`,
      [id]
    );
    
    if (quotationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    const quotation = quotationResult.rows[0];
    
    // Get parts
    const partsResult = await pool.query(
      `SELECT * FROM quotation_parts WHERE quotation_id = $1 ORDER BY part_id`,
      [id]
    );
    
    // Get operations for each part
    const parts = await Promise.all(partsResult.rows.map(async (part) => {
      const opsResult = await pool.query(
        `SELECT po.*, m.machine_name, m.machine_type, m.hourly_rate
         FROM part_operations po
         LEFT JOIN machines m ON po.machine_id = m.machine_id
         WHERE po.part_id = $1
         ORDER BY po.sequence_order`,
        [part.part_id]
      );
      
      const auxResult = await pool.query(
        `SELECT pac.*, ac.aux_type, ac.description
         FROM part_auxiliary_costs pac
         LEFT JOIN auxiliary_costs ac ON pac.aux_type_id = ac.aux_type_id
         WHERE pac.part_id = $1`,
        [part.part_id]
      );
      
      return {
        ...part,
        operations: opsResult.rows,
        auxiliary_costs: auxResult.rows
      };
    }));
    
    quotation.parts = parts;
    res.json(quotation);
  } catch (err) {
    console.error('Error fetching quotation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create quotation
router.post('/', validateQuotation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { customer_id, margin_percent = 0, notes, valid_until } = req.body;
    
    const result = await client.query(
      `INSERT INTO quotations (customer_id, margin_percent, notes, valid_until) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [customer_id, margin_percent, notes, valid_until]
    );
    
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating quotation:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PUT update quotation header
router.put('/:id', validateQuotation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { customer_id, margin_percent, notes, valid_until, status } = req.body;
    
    const result = await client.query(
      `UPDATE quotations 
       SET customer_id = $1, margin_percent = $2, notes = $3, valid_until = $4, status = COALESCE($5, status)
       WHERE quotation_id = $6 
       RETURNING *`,
      [customer_id, margin_percent, notes, valid_until, status, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    // Recalculate totals with new margin
    await recalculateQuotation(id, client);
    
    await client.query('COMMIT');
    
    // Fetch updated quotation
    const updated = await pool.query(
      `SELECT q.*, c.company_name 
       FROM quotations q 
       LEFT JOIN customers c ON q.customer_id = c.customer_id 
       WHERE q.quotation_id = $1`,
      [id]
    );
    
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating quotation:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PATCH update quotation status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['Draft', 'Submitted', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await pool.query(
      `UPDATE quotations SET status = $1 WHERE quotation_id = $2 RETURNING *`,
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating quotation status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE quotation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM quotations WHERE quotation_id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    res.json({ message: 'Quotation deleted successfully' });
  } catch (err) {
    console.error('Error deleting quotation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== PARTS ROUTES =====

// POST add part to quotation
router.post('/:id/parts', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { part_number, part_description, unit_material_cost = 0, quantity = 1 } = req.body;
    
    const result = await client.query(
      `INSERT INTO quotation_parts (quotation_id, part_number, part_description, unit_material_cost, quantity) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [id, part_number, part_description, unit_material_cost, quantity]
    );
    
    await recalculateQuotation(id, client);
    await client.query('COMMIT');
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding part:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PUT update part
router.put('/:id/parts/:partId', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id, partId } = req.params;
    const { part_number, part_description, unit_material_cost, quantity } = req.body;
    
    const result = await client.query(
      `UPDATE quotation_parts 
       SET part_number = $1, part_description = $2, unit_material_cost = $3, quantity = $4
       WHERE part_id = $5 AND quotation_id = $6 
       RETURNING *`,
      [part_number, part_description, unit_material_cost, quantity, partId, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Part not found' });
    }
    
    await recalculateQuotation(id, client);
    await client.query('COMMIT');
    
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating part:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// DELETE part
router.delete('/:id/parts/:partId', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id, partId } = req.params;
    
    const result = await client.query(
      'DELETE FROM quotation_parts WHERE part_id = $1 AND quotation_id = $2 RETURNING *',
      [partId, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Part not found' });
    }
    
    await recalculateQuotation(id, client);
    await client.query('COMMIT');
    
    res.json({ message: 'Part deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting part:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ===== OPERATIONS ROUTES =====

// POST add operation to part
router.post('/:id/parts/:partId/operations', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { partId } = req.params;
    const { machine_id, operation_name, estimated_hours = 0, estimated_minutes = 0, notes, sequence_order } = req.body;
    
    // Get machine hourly rate
    const machineResult = await client.query(
      'SELECT hourly_rate FROM machines WHERE machine_id = $1',
      [machine_id]
    );
    
    if (machineResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid machine' });
    }
    
    const hourlyRate = parseFloat(machineResult.rows[0].hourly_rate);
    const totalHours = parseFloat(estimated_hours) + (parseFloat(estimated_minutes) / 60);
    const operationCost = hourlyRate * totalHours;
    
    const result = await client.query(
      `INSERT INTO part_operations (part_id, machine_id, operation_name, estimated_hours, estimated_minutes, operation_cost, notes, sequence_order) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [partId, machine_id, operation_name, estimated_hours, estimated_minutes, operationCost, notes, sequence_order || 1]
    );
    
    await recalculatePartCosts(partId, client);
    await client.query('COMMIT');
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding operation:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PUT update operation
router.put('/:id/parts/:partId/operations/:opId', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { partId, opId } = req.params;
    const { machine_id, operation_name, estimated_hours = 0, estimated_minutes = 0, notes, sequence_order } = req.body;
    
    // Get machine hourly rate
    const machineResult = await client.query(
      'SELECT hourly_rate FROM machines WHERE machine_id = $1',
      [machine_id]
    );
    
    if (machineResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid machine' });
    }
    
    const hourlyRate = parseFloat(machineResult.rows[0].hourly_rate);
    const totalHours = parseFloat(estimated_hours) + (parseFloat(estimated_minutes) / 60);
    const operationCost = hourlyRate * totalHours;
    
    const result = await client.query(
      `UPDATE part_operations 
       SET machine_id = $1, operation_name = $2, estimated_hours = $3, estimated_minutes = $4, operation_cost = $5, notes = $6, sequence_order = $7
       WHERE operation_id = $8 AND part_id = $9 
       RETURNING *`,
      [machine_id, operation_name, estimated_hours, estimated_minutes, operationCost, notes, sequence_order, opId, partId]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Operation not found' });
    }
    
    await recalculatePartCosts(partId, client);
    await client.query('COMMIT');
    
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating operation:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// DELETE operation
router.delete('/:id/parts/:partId/operations/:opId', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { partId, opId } = req.params;
    
    const result = await client.query(
      'DELETE FROM part_operations WHERE operation_id = $1 AND part_id = $2 RETURNING *',
      [opId, partId]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Operation not found' });
    }
    
    await recalculatePartCosts(partId, client);
    await client.query('COMMIT');
    
    res.json({ message: 'Operation deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting operation:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ===== PART AUXILIARY COSTS ROUTES =====

// POST add auxiliary cost to part
router.post('/:id/parts/:partId/auxiliary-costs', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { partId } = req.params;
    const { aux_type_id, cost } = req.body;
    
    // Get default cost if not provided
    let finalCost = cost;
    if (finalCost === undefined || finalCost === null) {
      const auxResult = await client.query(
        'SELECT default_cost FROM auxiliary_costs WHERE aux_type_id = $1',
        [aux_type_id]
      );
      if (auxResult.rows.length > 0) {
        finalCost = auxResult.rows[0].default_cost;
      } else {
        finalCost = 0;
      }
    }
    
    const result = await client.query(
      `INSERT INTO part_auxiliary_costs (part_id, aux_type_id, cost) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [partId, aux_type_id, finalCost]
    );
    
    await recalculatePartCosts(partId, client);
    await client.query('COMMIT');
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding auxiliary cost:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PUT update part auxiliary cost
router.put('/:id/parts/:partId/auxiliary-costs/:auxId', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { partId, auxId } = req.params;
    const { aux_type_id, cost } = req.body;
    
    const result = await client.query(
      `UPDATE part_auxiliary_costs 
       SET aux_type_id = $1, cost = $2
       WHERE id = $3 AND part_id = $4 
       RETURNING *`,
      [aux_type_id, cost, auxId, partId]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Auxiliary cost not found' });
    }
    
    await recalculatePartCosts(partId, client);
    await client.query('COMMIT');
    
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating auxiliary cost:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// DELETE part auxiliary cost
router.delete('/:id/parts/:partId/auxiliary-costs/:auxId', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { partId, auxId } = req.params;
    
    const result = await client.query(
      'DELETE FROM part_auxiliary_costs WHERE id = $1 AND part_id = $2 RETURNING *',
      [auxId, partId]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Auxiliary cost not found' });
    }
    
    await recalculatePartCosts(partId, client);
    await client.query('COMMIT');
    
    res.json({ message: 'Auxiliary cost deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting auxiliary cost:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
