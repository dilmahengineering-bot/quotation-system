const db = require('../config/database');

// Get all quotations
exports.getAllQuotations = async (req, res, next) => {
  try {
    const { status, customerId, search, fromDate, toDate } = req.query;
    
    let query = `
      SELECT q.quotation_id, q.quote_number, q.quote_date, q.status, q.currency,
             q.total_quote_value, q.lead_time, q.created_at,
             c.company_name as customer_name, c.contact_person_name,
             u.full_name as created_by_name
      FROM quotations q
      JOIN customers c ON q.customer_id = c.customer_id
      LEFT JOIN users u ON q.created_by = u.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND q.status = $${paramIndex++}`;
      params.push(status);
    }

    if (customerId) {
      query += ` AND q.customer_id = $${paramIndex++}`;
      params.push(customerId);
    }

    if (fromDate) {
      query += ` AND q.quote_date >= $${paramIndex++}`;
      params.push(fromDate);
    }

    if (toDate) {
      query += ` AND q.quote_date <= $${paramIndex++}`;
      params.push(toDate);
    }

    if (search) {
      query += ` AND (q.quote_number ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY q.created_at DESC';

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

// Get quotation by ID with full details
exports.getQuotationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get quotation header
    const quotationResult = await db.query(`
      SELECT q.*, c.company_name, c.address as customer_address, 
             c.contact_person_name, c.email as customer_email, c.phone as customer_phone,
             c.vat_number, u.full_name as created_by_name
      FROM quotations q
      JOIN customers c ON q.customer_id = c.customer_id
      LEFT JOIN users u ON q.created_by = u.user_id
      WHERE q.quotation_id = $1
    `, [id]);

    if (quotationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    const quotation = quotationResult.rows[0];

    // Get parts
    const partsResult = await db.query(`
      SELECT * FROM quotation_parts 
      WHERE quotation_id = $1 
      ORDER BY sort_order, created_at
    `, [id]);

    // Get operations and auxiliary costs for each part
    const parts = await Promise.all(partsResult.rows.map(async (part) => {
      const operationsResult = await db.query(`
        SELECT po.*, m.machine_name, m.machine_type
        FROM part_operations po
        JOIN machines m ON po.machine_id = m.machine_id
        WHERE po.part_id = $1
        ORDER BY po.sort_order, po.created_at
      `, [part.part_id]);

      const auxCostsResult = await db.query(`
        SELECT pac.*, ac.aux_type, ac.description as aux_description
        FROM part_auxiliary_costs pac
        JOIN auxiliary_costs ac ON pac.aux_type_id = ac.aux_type_id
        WHERE pac.part_id = $1
      `, [part.part_id]);

      return {
        ...part,
        operations: operationsResult.rows,
        auxiliaryCosts: auxCostsResult.rows
      };
    }));

    // Get audit log
    const auditResult = await db.query(`
      SELECT al.*, u.full_name as performed_by_name
      FROM quotation_audit_log al
      LEFT JOIN users u ON al.performed_by = u.user_id
      WHERE al.quotation_id = $1
      ORDER BY al.performed_at DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...quotation,
        parts,
        auditLog: auditResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create quotation
exports.createQuotation = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');

    const { 
      customerId, quoteDate, leadTime, paymentTerms, currency, 
      shipmentType, marginPercent, discountPercent, vatPercent, 
      notes, validUntil, parts 
    } = req.body;

    // Generate quote number
    const quoteNumberResult = await client.query('SELECT generate_quote_number() as quote_number');
    const quoteNumber = quoteNumberResult.rows[0].quote_number;

    // Create quotation header
    const quotationResult = await client.query(`
      INSERT INTO quotations (
        quote_number, customer_id, quote_date, lead_time, payment_terms,
        currency, shipment_type, margin_percent, discount_percent, vat_percent,
        notes, valid_until, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Draft', $13)
      RETURNING quotation_id
    `, [
      quoteNumber, customerId, quoteDate || new Date(), leadTime, paymentTerms,
      currency || 'USD', shipmentType, marginPercent || 0, discountPercent || 0,
      vatPercent || 0, notes, validUntil, req.user.userId
    ]);

    const quotationId = quotationResult.rows[0].quotation_id;

    // Insert parts if provided
    if (parts && parts.length > 0) {
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        const partResult = await client.query(`
          INSERT INTO quotation_parts (
            quotation_id, part_number, part_description, unit_material_cost,
            quantity, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING part_id
        `, [
          quotationId, part.partNumber, part.partDescription,
          part.unitMaterialCost || 0, part.quantity || 1, i
        ]);

        const partId = partResult.rows[0].part_id;

        // Insert operations
        if (part.operations && part.operations.length > 0) {
          for (let j = 0; j < part.operations.length; j++) {
            const op = part.operations[j];
            
            // Get machine hourly rate
            const machineResult = await client.query(
              'SELECT hourly_rate FROM machines WHERE machine_id = $1',
              [op.machineId]
            );
            const hourlyRate = op.hourlyRate || machineResult.rows[0]?.hourly_rate || 0;
            const operationCost = hourlyRate * (op.estimatedTimeHours || 0);

            await client.query(`
              INSERT INTO part_operations (
                part_id, machine_id, operation_name, estimated_time_hours,
                hourly_rate, operation_cost, sort_order, notes
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
              partId, op.machineId, op.operationName, op.estimatedTimeHours || 0,
              hourlyRate, operationCost, j, op.notes
            ]);
          }
        }

        // Insert auxiliary costs
        if (part.auxiliaryCosts && part.auxiliaryCosts.length > 0) {
          for (const aux of part.auxiliaryCosts) {
            await client.query(`
              INSERT INTO part_auxiliary_costs (part_id, aux_type_id, cost, notes)
              VALUES ($1, $2, $3, $4)
            `, [partId, aux.auxTypeId, aux.cost || 0, aux.notes]);
          }
        }
      }
    }

    // Recalculate totals
    await recalculateQuotation(client, quotationId);

    // Add audit log
    await client.query(`
      INSERT INTO quotation_audit_log (quotation_id, action, new_status, performed_by, comments)
      VALUES ($1, 'Created', 'Draft', $2, 'Quotation created')
    `, [quotationId, req.user.userId]);

    await client.query('COMMIT');

    // Fetch and return the complete quotation
    const result = await db.query(`
      SELECT q.*, c.company_name
      FROM quotations q
      JOIN customers c ON q.customer_id = c.customer_id
      WHERE q.quotation_id = $1
    `, [quotationId]);

    res.status(201).json({
      success: true,
      message: 'Quotation created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Helper function to recalculate quotation totals
async function recalculateQuotation(client, quotationId) {
  // Update part-level costs
  await client.query(`
    UPDATE quotation_parts SET
      unit_operations_cost = COALESCE((
        SELECT SUM(operation_cost) FROM part_operations WHERE part_id = quotation_parts.part_id
      ), 0),
      unit_auxiliary_cost = COALESCE((
        SELECT SUM(cost) FROM part_auxiliary_costs WHERE part_id = quotation_parts.part_id
      ), 0)
    WHERE quotation_id = $1
  `, [quotationId]);

  // Update part subtotals
  await client.query(`
    UPDATE quotation_parts SET
      part_subtotal = (unit_material_cost + unit_operations_cost + unit_auxiliary_cost) * quantity
    WHERE quotation_id = $1
  `, [quotationId]);

  // Update quotation totals
  await client.query(`
    UPDATE quotations SET
      total_parts_cost = COALESCE((
        SELECT SUM((unit_material_cost + unit_operations_cost) * quantity) 
        FROM quotation_parts WHERE quotation_id = $1
      ), 0),
      total_auxiliary_cost = COALESCE((
        SELECT SUM(unit_auxiliary_cost * quantity) 
        FROM quotation_parts WHERE quotation_id = $1
      ), 0),
      subtotal = COALESCE((
        SELECT SUM(part_subtotal) FROM quotation_parts WHERE quotation_id = $1
      ), 0)
    WHERE quotation_id = $1
  `, [quotationId]);

  // Calculate final totals
  await client.query(`
    UPDATE quotations SET
      discount_amount = subtotal * (discount_percent / 100),
      margin_amount = subtotal * (margin_percent / 100),
      vat_amount = (subtotal - (subtotal * discount_percent / 100) + (subtotal * margin_percent / 100)) * (vat_percent / 100),
      total_quote_value = subtotal 
        - (subtotal * discount_percent / 100) 
        + (subtotal * margin_percent / 100) 
        + ((subtotal - (subtotal * discount_percent / 100) + (subtotal * margin_percent / 100)) * (vat_percent / 100))
    WHERE quotation_id = $1
  `, [quotationId]);
}

// Update quotation
exports.updateQuotation = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { 
      customerId, quoteDate, leadTime, paymentTerms, currency, 
      shipmentType, marginPercent, discountPercent, vatPercent, 
      notes, validUntil 
    } = req.body;

    // Check if quotation exists and is editable
    const checkResult = await client.query(
      'SELECT status FROM quotations WHERE quotation_id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    const currentStatus = checkResult.rows[0].status;
    if (!['Draft', 'Rejected'].includes(currentStatus)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Cannot edit quotation in ${currentStatus} status`
      });
    }

    // Update quotation header
    await client.query(`
      UPDATE quotations SET
        customer_id = COALESCE($1, customer_id),
        quote_date = COALESCE($2, quote_date),
        lead_time = COALESCE($3, lead_time),
        payment_terms = COALESCE($4, payment_terms),
        currency = COALESCE($5, currency),
        shipment_type = COALESCE($6, shipment_type),
        margin_percent = COALESCE($7, margin_percent),
        discount_percent = COALESCE($8, discount_percent),
        vat_percent = COALESCE($9, vat_percent),
        notes = COALESCE($10, notes),
        valid_until = COALESCE($11, valid_until),
        updated_by = $12
      WHERE quotation_id = $13
    `, [
      customerId, quoteDate, leadTime, paymentTerms, currency,
      shipmentType, marginPercent, discountPercent, vatPercent,
      notes, validUntil, req.user.userId, id
    ]);

    // Recalculate totals
    await recalculateQuotation(client, id);

    // Add audit log
    await client.query(`
      INSERT INTO quotation_audit_log (quotation_id, action, performed_by, comments)
      VALUES ($1, 'Updated', $2, 'Quotation header updated')
    `, [id, req.user.userId]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Quotation updated successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Export recalculate function for use in other modules
exports.recalculateQuotation = recalculateQuotation;
