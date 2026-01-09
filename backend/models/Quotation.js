const pool = require('../config/database');

class Quotation {
  // Generate unique quote number
  static async generateQuoteNumber() {
    const query = 'SELECT generate_quote_number() as quote_number';
    const result = await pool.query(query);
    return result.rows[0].quote_number;
  }

  // Create new quotation
  static async create(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const quote_number = await this.generateQuoteNumber();
      const {
        customer_id,
        quotation_date,
        lead_time,
        payment_terms,
        currency,
        shipment_type,
        parts = [],
        discount_percent = 0,
        margin_percent = 0,
        vat_percent = 0
      } = data;

      // Create quotation header
      const quotationQuery = `
        INSERT INTO quotations (
          quote_number, customer_id, quotation_date, lead_time,
          payment_terms, currency, shipment_type, discount_percent,
          margin_percent, vat_percent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const quotationResult = await client.query(quotationQuery, [
        quote_number,
        customer_id,
        quotation_date,
        lead_time,
        payment_terms,
        currency,
        shipment_type,
        discount_percent,
        margin_percent,
        vat_percent
      ]);

      const quotation_id = quotationResult.rows[0].quotation_id;

      // Insert parts and calculate costs
      for (const part of parts) {
        const partQuery = `
          INSERT INTO quotation_parts (
            quotation_id, part_number, part_description,
            unit_material_cost, quantity
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        const partResult = await client.query(partQuery, [
          quotation_id,
          part.part_number,
          part.part_description,
          part.unit_material_cost || 0,
          part.quantity || 1
        ]);

        const part_id = partResult.rows[0].part_id;

        // Insert operations
        let unit_operations_cost = 0;
        if (part.operations && part.operations.length > 0) {
          for (const operation of part.operations) {
            // Get machine hourly rate
            const machineQuery = 'SELECT hourly_rate FROM machines WHERE machine_id = $1';
            const machineResult = await client.query(machineQuery, [operation.machine_id]);
            const hourly_rate = machineResult.rows[0]?.hourly_rate || 0;

            const operation_cost = hourly_rate * operation.operation_time_hours;

            const operationQuery = `
              INSERT INTO part_operations (
                part_id, machine_id, operation_time_hours, operation_cost
              ) VALUES ($1, $2, $3, $4)
            `;
            await client.query(operationQuery, [
              part_id,
              operation.machine_id,
              operation.operation_time_hours,
              operation_cost
            ]);

            unit_operations_cost += operation_cost;
          }
        }

        // Insert auxiliary costs
        let unit_auxiliary_cost = 0;
        if (part.auxiliary_costs && part.auxiliary_costs.length > 0) {
          for (const auxCost of part.auxiliary_costs) {
            const auxQuery = `
              INSERT INTO part_auxiliary_costs (part_id, aux_type_id, cost)
              VALUES ($1, $2, $3)
            `;
            await client.query(auxQuery, [part_id, auxCost.aux_type_id, auxCost.cost]);
            unit_auxiliary_cost += parseFloat(auxCost.cost);
          }
        }

        // Update part costs
        const part_subtotal = (
          (parseFloat(part.unit_material_cost || 0) + unit_operations_cost + unit_auxiliary_cost) *
          parseInt(part.quantity || 1)
        );

        const updatePartQuery = `
          UPDATE quotation_parts
          SET unit_operations_cost = $1,
              unit_auxiliary_cost = $2,
              part_subtotal = $3
          WHERE part_id = $4
        `;
        await client.query(updatePartQuery, [
          unit_operations_cost,
          unit_auxiliary_cost,
          part_subtotal,
          part_id
        ]);
      }

      // Calculate quotation totals
      await this.calculateTotals(client, quotation_id);

      await client.query('COMMIT');

      // Return complete quotation
      return await this.getById(quotation_id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Calculate quotation totals
  static async calculateTotals(client, quotation_id) {
    // Get sum of all part subtotals
    const partsQuery = `
      SELECT COALESCE(SUM(part_subtotal), 0) as total_parts_cost
      FROM quotation_parts
      WHERE quotation_id = $1
    `;
    const partsResult = await client.query(partsQuery, [quotation_id]);
    const total_parts_cost = parseFloat(partsResult.rows[0].total_parts_cost);

    // Get quotation discount and margin percentages
    const quotationQuery = `
      SELECT discount_percent, margin_percent, vat_percent
      FROM quotations
      WHERE quotation_id = $1
    `;
    const quotationResult = await client.query(quotationQuery, [quotation_id]);
    const { discount_percent, margin_percent, vat_percent } = quotationResult.rows[0];

    const subtotal = total_parts_cost;
    const discount_amount = subtotal * (parseFloat(discount_percent) / 100);
    const after_discount = subtotal - discount_amount;
    const margin_amount = after_discount * (parseFloat(margin_percent) / 100);
    const after_margin = after_discount + margin_amount;
    const vat_amount = after_margin * (parseFloat(vat_percent) / 100);
    const total_quote_value = after_margin + vat_amount;

    // Update quotation totals
    const updateQuery = `
      UPDATE quotations
      SET total_parts_cost = $1,
          subtotal = $2,
          discount_amount = $3,
          margin_amount = $4,
          vat_amount = $5,
          total_quote_value = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE quotation_id = $7
    `;
    await client.query(updateQuery, [
      total_parts_cost,
      subtotal,
      discount_amount,
      margin_amount,
      vat_amount,
      total_quote_value,
      quotation_id
    ]);
  }

  // Get quotation by ID with all details
  static async getById(id) {
    const quotationQuery = `
      SELECT q.*, c.company_name, c.contact_person_name, c.email, c.phone, c.address
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.customer_id
      WHERE q.quotation_id = $1
    `;
    const quotationResult = await pool.query(quotationQuery, [id]);
    
    if (quotationResult.rows.length === 0) {
      return null;
    }

    const quotation = quotationResult.rows[0];

    // Get parts
    const partsQuery = `
      SELECT * FROM quotation_parts
      WHERE quotation_id = $1
      ORDER BY part_id
    `;
    const partsResult = await pool.query(partsQuery, [id]);
    quotation.parts = partsResult.rows;

    // Get operations and auxiliary costs for each part
    for (const part of quotation.parts) {
      // Get operations
      const operationsQuery = `
        SELECT po.*, m.machine_name, m.machine_type, m.hourly_rate
        FROM part_operations po
        LEFT JOIN machines m ON po.machine_id = m.machine_id
        WHERE po.part_id = $1
        ORDER BY po.operation_id
      `;
      const operationsResult = await pool.query(operationsQuery, [part.part_id]);
      part.operations = operationsResult.rows;

      // Get auxiliary costs
      const auxQuery = `
        SELECT pac.*, ac.aux_type, ac.description
        FROM part_auxiliary_costs pac
        LEFT JOIN auxiliary_costs ac ON pac.aux_type_id = ac.aux_type_id
        WHERE pac.part_id = $1
        ORDER BY pac.part_aux_id
      `;
      const auxResult = await pool.query(auxQuery, [part.part_id]);
      part.auxiliary_costs = auxResult.rows;
    }

    return quotation;
  }

  // Get all quotations
  static async getAll() {
    const query = `
      SELECT q.*, c.company_name
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.customer_id
      ORDER BY q.quotation_id DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Update quotation status
  static async updateStatus(id, status) {
    const query = `
      UPDATE quotations
      SET quotation_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE quotation_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  // Update quotation
  static async update(id, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        customer_id,
        quotation_date,
        lead_time,
        payment_terms,
        currency,
        shipment_type,
        discount_percent,
        margin_percent,
        vat_percent,
        quotation_status
      } = data;

      // Update quotation header
      const updateQuery = `
        UPDATE quotations
        SET customer_id = $1, quotation_date = $2, lead_time = $3,
            payment_terms = $4, currency = $5, shipment_type = $6,
            discount_percent = $7, margin_percent = $8, vat_percent = $9,
            quotation_status = $10, updated_at = CURRENT_TIMESTAMP
        WHERE quotation_id = $11
      `;
      await client.query(updateQuery, [
        customer_id,
        quotation_date,
        lead_time,
        payment_terms,
        currency,
        shipment_type,
        discount_percent,
        margin_percent,
        vat_percent,
        quotation_status,
        id
      ]);

      // Recalculate totals
      await this.calculateTotals(client, id);

      await client.query('COMMIT');

      return await this.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete quotation
  static async delete(id) {
    const query = 'DELETE FROM quotations WHERE quotation_id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Quotation;
