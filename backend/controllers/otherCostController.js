const OtherCost = require('../models/OtherCost');

// =====================================================
// OTHER COST TYPES (Master Data) - Admin Only
// =====================================================

/**
 * Get all active other cost types
 */
exports.getAllTypes = async (req, res) => {
  try {
    const otherCostTypes = await OtherCost.findAll();
    res.json(otherCostTypes);
  } catch (error) {
    console.error('Error fetching other cost types:', error);
    res.status(500).json({ error: 'Failed to fetch other cost types' });
  }
};

/**
 * Get a specific other cost type
 */
exports.getTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const otherCostType = await OtherCost.findById(id);
    
    if (!otherCostType) {
      return res.status(404).json({ error: 'Other cost type not found' });
    }
    
    res.json(otherCostType);
  } catch (error) {
    console.error('Error fetching other cost type:', error);
    res.status(500).json({ error: 'Failed to fetch other cost type' });
  }
};

/**
 * Create a new other cost type (Admin only)
 */
exports.createType = async (req, res) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user.user_id
    };
    
    const otherCostType = await OtherCost.create(data);
    res.status(201).json(otherCostType);
  } catch (error) {
    console.error('Error creating other cost type:', error);
    res.status(500).json({ error: 'Failed to create other cost type' });
  }
};

/**
 * Update an other cost type (Admin only)
 */
exports.updateType = async (req, res) => {
  try {
    const { id } = req.params;
    const data = {
      ...req.body,
      updated_by: req.user.user_id
    };
    
    const otherCostType = await OtherCost.update(id, data);
    
    if (!otherCostType) {
      return res.status(404).json({ error: 'Other cost type not found' });
    }
    
    res.json(otherCostType);
  } catch (error) {
    console.error('Error updating other cost type:', error);
    res.status(500).json({ error: 'Failed to update other cost type' });
  }
};

/**
 * Delete (soft delete) an other cost type (Admin only)
 */
exports.deleteType = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedType = await OtherCost.delete(id);
    
    if (!deletedType) {
      return res.status(404).json({ error: 'Other cost type not found' });
    }
    
    res.json({ message: 'Other cost type deleted successfully', deletedType });
  } catch (error) {
    console.error('Error deleting other cost type:', error);
    res.status(500).json({ error: 'Failed to delete other cost type' });
  }
};

// =====================================================
// QUOTATION OTHER COSTS (Per Quotation)
// =====================================================

/**
 * Get all other costs for a specific quotation
 */
exports.getByQuotationId = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const otherCosts = await OtherCost.findByQuotation(quotationId);
    res.json(otherCosts);
  } catch (error) {
    console.error('Error fetching quotation other costs:', error);
    res.status(500).json({ error: 'Failed to fetch quotation other costs' });
  }
};

/**
 * Add other cost to a quotation
 */
exports.addToQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const data = {
      ...req.body,
      quotation_id: quotationId
    };
    
    const otherCost = await OtherCost.addToQuotation(data);
    res.status(201).json(otherCost);
  } catch (error) {
    console.error('Error adding other cost to quotation:', error);
    res.status(500).json({ error: 'Failed to add other cost to quotation' });
  }
};

/**
 * Update a quotation other cost
 */
exports.updateQuotationOtherCost = async (req, res) => {
  try {
    const { id } = req.params;
    const otherCost = await OtherCost.updateQuotationOtherCost(id, req.body);
    
    if (!otherCost) {
      return res.status(404).json({ error: 'Quotation other cost not found' });
    }
    
    res.json(otherCost);
  } catch (error) {
    console.error('Error updating quotation other cost:', error);
    res.status(500).json({ error: 'Failed to update quotation other cost' });
  }
};

/**
 * Remove other cost from quotation
 */
exports.removeFromQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCost = await OtherCost.removeFromQuotation(id);
    
    if (!deletedCost) {
      return res.status(404).json({ error: 'Quotation other cost not found' });
    }
    
    res.json({ message: 'Other cost removed successfully', deletedCost });
  } catch (error) {
    console.error('Error removing other cost:', error);
    res.status(500).json({ error: 'Failed to remove other cost' });
  }
};

/**
 * Get total other costs for a quotation
 */
exports.getTotalForQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const total = await OtherCost.getTotalForQuotation(quotationId);
    res.json({ total_other_cost: total });
  } catch (error) {
    console.error('Error calculating total other costs:', error);
    res.status(500).json({ error: 'Failed to calculate total other costs' });
  }
};
