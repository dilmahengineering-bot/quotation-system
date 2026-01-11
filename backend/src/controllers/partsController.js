const db = require('../config/database');
const { recalculateQuotation } = require('./quotationController');

// Add part to quotation
exports.addPart = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { quotationId } = req.params;
    const { partNumber, partDescription, unitMaterialCost, quantity } = req.body;

    // Check quotation status
    const checkResult = await client.query(
      'SELECT status FROM quotations WHERE quotation_id = $1',
      [quotationId]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (!['Draft', 'Rejected'].includes(checkResult.rows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify quotation in current status' 
      });
    }

    // Get max sort order
    const sortResult = await client.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM quotation_parts WHERE quotation_id = $1',
      [quotationId]
    );

    const result = await client.query(`
      INSERT INTO quotation_parts (quotation_id, part_number, part_description, unit_material_cost, quantity, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [quotationId, partNumber, partDescription, unitMaterialCost || 0, quantity || 1, sortResult.rows[0].next_order]);

    await recalculateQuotation(client, quotationId);
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Part added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Update part
exports.updatePart = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { quotationId, partId } = req.params;
    const { partNumber, partDescription, unitMaterialCost, quantity } = req.body;

    // Verify part belongs to quotation and check status
    const checkResult = await client.query(`
      SELECT q.status FROM quotations q
      JOIN quotation_parts p ON q.quotation_id = p.quotation_id
      WHERE q.quotation_id = $1 AND p.part_id = $2
    `, [quotationId, partId]);

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Part not found' });
    }

    if (!['Draft', 'Rejected'].includes(checkResult.rows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify quotation in current status' 
      });
    }

    const result = await client.query(`
      UPDATE quotation_parts SET
        part_number = COALESCE($1, part_number),
        part_description = COALESCE($2, part_description),
        unit_material_cost = COALESCE($3, unit_material_cost),
        quantity = COALESCE($4, quantity)
      WHERE part_id = $5
      RETURNING *
    `, [partNumber, partDescription, unitMaterialCost, quantity, partId]);

    await recalculateQuotation(client, quotationId);
    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Part updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Delete part
exports.deletePart = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { quotationId, partId } = req.params;

    // Verify and check status
    const checkResult = await client.query(`
      SELECT q.status FROM quotations q
      JOIN quotation_parts p ON q.quotation_id = p.quotation_id
      WHERE q.quotation_id = $1 AND p.part_id = $2
    `, [quotationId, partId]);

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Part not found' });
    }

    if (!['Draft', 'Rejected'].includes(checkResult.rows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify quotation in current status' 
      });
    }

    // Delete part (cascade will delete operations and aux costs)
    await client.query('DELETE FROM quotation_parts WHERE part_id = $1', [partId]);

    await recalculateQuotation(client, quotationId);
    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Part deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Add operation to part
exports.addOperation = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { quotationId, partId } = req.params;
    const { machineId, operationName, estimatedTimeHours, hourlyRate, notes } = req.body;

    // Verify part and check status
    const checkResult = await client.query(`
      SELECT q.status FROM quotations q
      JOIN quotation_parts p ON q.quotation_id = p.quotation_id
      WHERE q.quotation_id = $1 AND p.part_id = $2
    `, [quotationId, partId]);

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Part not found' });
    }

    if (!['Draft', 'Rejected'].includes(checkResult.rows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify quotation in current status' 
      });
    }

    // Get machine hourly rate if not provided
    let rate = hourlyRate;
    if (!rate) {
      const machineResult = await client.query(
        'SELECT hourly_rate FROM machines WHERE machine_id = $1',
        [machineId]
      );
      rate = machineResult.rows[0]?.hourly_rate || 0;
    }

    const operationCost = rate * (estimatedTimeHours || 0);

    // Get max sort order
    const sortResult = await client.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM part_operations WHERE part_id = $1',
      [partId]
    );

    const result = await client.query(`
      INSERT INTO part_operations (part_id, machine_id, operation_name, estimated_time_hours, hourly_rate, operation_cost, sort_order, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [partId, machineId, operationName, estimatedTimeHours || 0, rate, operationCost, sortResult.rows[0].next_order, notes]);

    await recalculateQuotation(client, quotationId);
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Operation added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Update operation
exports.updateOperation = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { quotationId, partId, operationId } = req.params;
    const { machineId, operationName, estimatedTimeHours, hourlyRate, notes } = req.body;

    // Verify operation and check status
    const checkResult = await client.query(`
      SELECT q.status, po.hourly_rate as current_rate FROM quotations q
      JOIN quotation_parts p ON q.quotation_id = p.quotation_id
      JOIN part_operations po ON p.part_id = po.part_id
      WHERE q.quotation_id = $1 AND p.part_id = $2 AND po.operation_id = $3
    `, [quotationId, partId, operationId]);

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Operation not found' });
    }

    if (!['Draft', 'Rejected'].includes(checkResult.rows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify quotation in current status' 
      });
    }

    // Calculate new operation cost
    let rate = hourlyRate;
    if (machineId && !hourlyRate) {
      const machineResult = await client.query(
        'SELECT hourly_rate FROM machines WHERE machine_id = $1',
        [machineId]
      );
      rate = machineResult.rows[0]?.hourly_rate;
    }

    // Get current values for calculation
    const currentOp = await client.query(
      'SELECT estimated_time_hours, hourly_rate FROM part_operations WHERE operation_id = $1',
      [operationId]
    );

    const finalRate = rate !== undefined ? rate : currentOp.rows[0].hourly_rate;
    const finalTime = estimatedTimeHours !== undefined ? estimatedTimeHours : currentOp.rows[0].estimated_time_hours;
    const operationCost = finalRate * finalTime;

    const result = await client.query(`
      UPDATE part_operations SET
        machine_id = COALESCE($1, machine_id),
        operation_name = COALESCE($2, operation_name),
        estimated_time_hours = COALESCE($3, estimated_time_hours),
        hourly_rate = COALESCE($4, hourly_rate),
        operation_cost = $5,
        notes = COALESCE($6, notes)
      WHERE operation_id = $7
      RETURNING *
    `, [machineId, operationName, estimatedTimeHours, rate, operationCost, notes, operationId]);

    await recalculateQuotation(client, quotationId);
    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Operation updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Delete operation
exports.deleteOperation = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { quotationId, partId, operationId } = req.params;

    // Verify and check status
    const checkResult = await client.query(`
      SELECT q.status FROM quotations q
      JOIN quotation_parts p ON q.quotation_id = p.quotation_id
      JOIN part_operations po ON p.part_id = po.part_id
      WHERE q.quotation_id = $1 AND p.part_id = $2 AND po.operation_id = $3
    `, [quotationId, partId, operationId]);

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Operation not found' });
    }

    if (!['Draft', 'Rejected'].includes(checkResult.rows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify quotation in current status' 
      });
    }

    await client.query('DELETE FROM part_operations WHERE operation_id = $1', [operationId]);

    await recalculateQuotation(client, quotationId);
    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Operation deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Add auxiliary cost to part
exports.addAuxiliaryCost = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { quotationId, partId } = req.params;
    const { auxTypeId, cost, notes } = req.body;

    // Verify part and check status
    const checkResult = await client.query(`
      SELECT q.status FROM quotations q
      JOIN quotation_parts p ON q.quotation_id = p.quotation_id
      WHERE q.quotation_id = $1 AND p.part_id = $2
    `, [quotationId, partId]);

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Part not found' });
    }

    if (!['Draft', 'Rejected'].includes(checkResult.rows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify quotation in current status' 
      });
    }

    // Get default cost if not provided
    let auxCost = cost;
    if (auxCost === undefined) {
      const auxResult = await client.query(
        'SELECT default_cost FROM auxiliary_costs WHERE aux_type_id = $1',
        [auxTypeId]
      );
      auxCost = auxResult.rows[0]?.default_cost || 0;
    }

    const result = await client.query(`
      INSERT INTO part_auxiliary_costs (part_id, aux_type_id, cost, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [partId, auxTypeId, auxCost, notes]);

    await recalculateQuotation(client, quotationId);
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Auxiliary cost added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Update auxiliary cost
exports.updateAuxiliaryCost = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { quotationId, partId, auxCostId } = req.params;
    const { cost, notes } = req.body;

    // Verify and check status
    const checkResult = await client.query(`
      SELECT q.status FROM quotations q
      JOIN quotation_parts p ON q.quotation_id = p.quotation_id
      JOIN part_auxiliary_costs pac ON p.part_id = pac.part_id
      WHERE q.quotation_id = $1 AND p.part_id = $2 AND pac.part_aux_id = $3
    `, [quotationId, partId, auxCostId]);

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Auxiliary cost not found' });
    }

    if (!['Draft', 'Rejected'].includes(checkResult.rows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify quotation in current status' 
      });
    }

    const result = await client.query(`
      UPDATE part_auxiliary_costs SET
        cost = COALESCE($1, cost),
        notes = COALESCE($2, notes)
      WHERE part_aux_id = $3
      RETURNING *
    `, [cost, notes, auxCostId]);

    await recalculateQuotation(client, quotationId);
    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Auxiliary cost updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Delete auxiliary cost
exports.deleteAuxiliaryCost = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { quotationId, partId, auxCostId } = req.params;

    // Verify and check status
    const checkResult = await client.query(`
      SELECT q.status FROM quotations q
      JOIN quotation_parts p ON q.quotation_id = p.quotation_id
      JOIN part_auxiliary_costs pac ON p.part_id = pac.part_id
      WHERE q.quotation_id = $1 AND p.part_id = $2 AND pac.part_aux_id = $3
    `, [quotationId, partId, auxCostId]);

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Auxiliary cost not found' });
    }

    if (!['Draft', 'Rejected'].includes(checkResult.rows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify quotation in current status' 
      });
    }

    await client.query('DELETE FROM part_auxiliary_costs WHERE part_aux_id = $1', [auxCostId]);

    await recalculateQuotation(client, quotationId);
    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Auxiliary cost deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};
