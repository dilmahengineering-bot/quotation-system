const pool = require('../config/database');

class OtherCost {
  // =====================================================
  // OTHER COST TYPES (Master Data)
  // =====================================================
  
  /**
   * Get all active other cost types
   */
  static async findAll() {
    const query = `
      SELECT * FROM other_costs
      WHERE is_active = true
      ORDER BY sort_order ASC, cost_type ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get a specific other cost type
   */
  static async findById(id) {
    const query = 'SELECT * FROM other_costs WHERE other_cost_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Create a new other cost type (Admin only)
   */
  static async create(data) {
    const { cost_type, description, default_rate, sort_order, created_by } = data;
    
    const query = `
      INSERT INTO other_costs (
        cost_type, description, default_rate, sort_order, created_by
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      cost_type,
      description,
      default_rate || 0,
      sort_order || 0,
      created_by
    ]);
    
    return result.rows[0];
  }

  /**
   * Update an other cost type
   */
  static async update(id, data) {
    const { cost_type, description, default_rate, sort_order, is_active, updated_by } = data;
    
    const query = `
      UPDATE other_costs
      SET cost_type = COALESCE($1, cost_type),
          description = COALESCE($2, description),
          default_rate = COALESCE($3, default_rate),
          sort_order = COALESCE($4, sort_order),
          is_active = COALESCE($5, is_active),
          updated_by = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE other_cost_id = $7
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      cost_type,
      description,
      default_rate,
      sort_order,
      is_active,
      updated_by,
      id
    ]);
    
    return result.rows[0];
  }

  /**
   * Soft delete an other cost type
   */
  static async delete(id) {
    const query = `
      UPDATE other_costs
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE other_cost_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // =====================================================
  // QUOTATION OTHER COSTS (Per Quotation)
  // =====================================================

  /**
   * Get all other costs for a specific quotation
   */
  static async findByQuotation(quotationId) {
    const query = `
      SELECT 
        qoc.*,
        oc.cost_type,
        oc.description as cost_description
      FROM quotation_other_costs qoc
      JOIN other_costs oc ON qoc.other_cost_id = oc.other_cost_id
      WHERE qoc.quotation_id = $1
      ORDER BY oc.sort_order ASC
    `;
    const result = await pool.query(query, [quotationId]);
    return result.rows;
  }

  /**
   * Add other cost to a quotation
   */
  static async addToQuotation(data) {
    const { quotation_id, other_cost_id, quantity, rate_per_hour, notes } = data;
    
    // Cost will be calculated by database trigger
    const cost = (quantity || 1) * (rate_per_hour || 0);
    
    const query = `
      INSERT INTO quotation_other_costs (
        quotation_id, other_cost_id, quantity, rate_per_hour, cost, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      quotation_id,
      other_cost_id,
      quantity || 1,
      rate_per_hour || 0,
      cost,
      notes
    ]);
    
    return result.rows[0];
  }

  /**
   * Update a quotation other cost
   */
  static async updateQuotationOtherCost(quotationOtherCostId, data) {
    const { quantity, rate_per_hour, notes } = data;
    
    const query = `
      UPDATE quotation_other_costs
      SET quantity = COALESCE($1, quantity),
          rate_per_hour = COALESCE($2, rate_per_hour),
          notes = COALESCE($3, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE quotation_other_cost_id = $4
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      quantity,
      rate_per_hour,
      notes,
      quotationOtherCostId
    ]);
    
    return result.rows[0];
  }

  /**
   * Remove other cost from quotation
   */
  static async removeFromQuotation(quotationOtherCostId) {
    const query = `
      DELETE FROM quotation_other_costs
      WHERE quotation_other_cost_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [quotationOtherCostId]);
    return result.rows[0];
  }

  /**
   * Get total other costs for a quotation
   */
  static async getTotalForQuotation(quotationId) {
    const query = `
      SELECT COALESCE(SUM(cost), 0) as total_other_cost
      FROM quotation_other_costs
      WHERE quotation_id = $1
    `;
    const result = await pool.query(query, [quotationId]);
    return parseFloat(result.rows[0].total_other_cost);
  }

  /**
   * Delete all other costs for a quotation
   */
  static async deleteByQuotationId(quotationId) {
    const query = 'DELETE FROM quotation_other_costs WHERE quotation_id = $1';
    await pool.query(query, [quotationId]);
  }
}

module.exports = OtherCost;

