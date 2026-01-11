const { 
  Quotation, 
  QuotationPart, 
  PartOperation, 
  PartAuxiliaryCost,
  Customer,
  Machine,
  AuxiliaryCost,
  User
} = require('../models');
const { sequelize } = require('../config/database');

// Helper function to generate 10-digit quote number
const generateQuoteNumber = async () => {
  const prefix = new Date().getFullYear().toString().slice(-2);
  const lastQuote = await Quotation.findOne({
    where: sequelize.where(
      sequelize.fn('LEFT', sequelize.col('quote_number'), 2),
      prefix
    ),
    order: [['quote_number', 'DESC']]
  });

  let nextNumber = 1;
  if (lastQuote) {
    const lastNumber = parseInt(lastQuote.quote_number.slice(-8));
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(8, '0')}`;
};

// Helper function to calculate quotation totals
const calculateQuotationTotals = (quotation, parts) => {
  let totalPartsCost = 0;
  let totalAuxiliaryCost = 0;

  parts.forEach(part => {
    const partTotal = parseFloat(part.part_subtotal || 0);
    totalPartsCost += partTotal;
    totalAuxiliaryCost += parseFloat(part.unit_auxiliary_cost || 0) * parseInt(part.quantity || 1);
  });

  const subtotal = totalPartsCost;
  const discountAmount = subtotal * (parseFloat(quotation.discount_percent || 0) / 100);
  const marginAmount = subtotal * (parseFloat(quotation.margin_percent || 0) / 100);
  const afterDiscountMargin = subtotal - discountAmount + marginAmount;
  const vatAmount = afterDiscountMargin * (parseFloat(quotation.vat_percent || 0) / 100);
  const totalQuoteValue = afterDiscountMargin + vatAmount;

  return {
    total_parts_cost: totalPartsCost.toFixed(2),
    total_auxiliary_cost: totalAuxiliaryCost.toFixed(2),
    subtotal: subtotal.toFixed(2),
    discount_amount: discountAmount.toFixed(2),
    margin_amount: marginAmount.toFixed(2),
    vat_amount: vatAmount.toFixed(2),
    total_quote_value: totalQuoteValue.toFixed(2)
  };
};

// @desc    Get all quotations
// @route   GET /api/quotations
// @access  Private
exports.getQuotations = async (req, res) => {
  try {
    const { status } = req.query;
    
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    // Users can only see their own quotations, approvers and admins see all
    if (req.user.user_level === 'user') {
      whereClause.created_by = req.user.user_id;
    }

    const quotations = await Quotation.findAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['customer_id', 'company_name', 'contact_person_name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'full_name', 'username']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: quotations.length,
      data: quotations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single quotation with full details
// @route   GET /api/quotations/:id
// @access  Private
exports.getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'full_name', 'username']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['user_id', 'full_name', 'username']
        },
        {
          model: QuotationPart,
          as: 'parts',
          include: [
            {
              model: PartOperation,
              as: 'operations',
              include: [
                {
                  model: Machine,
                  as: 'machine',
                  attributes: ['machine_id', 'machine_name', 'machine_type']
                }
              ]
            },
            {
              model: PartAuxiliaryCost,
              as: 'auxiliaryCosts',
              include: [
                {
                  model: AuxiliaryCost,
                  as: 'auxiliaryType',
                  attributes: ['aux_type_id', 'aux_type', 'description']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    // Check access rights
    if (req.user.user_level === 'user' && quotation.created_by !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this quotation'
      });
    }

    res.status(200).json({
      success: true,
      data: quotation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new quotation
// @route   POST /api/quotations
// @access  Private
exports.createQuotation = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      customer_id,
      quote_date,
      lead_time,
      payment_terms,
      currency,
      shipment_type,
      margin_percent,
      discount_percent,
      vat_percent,
      notes,
      parts
    } = req.body;

    // Generate quote number
    const quote_number = await generateQuoteNumber();

    // Create quotation header
    const quotation = await Quotation.create({
      quote_number,
      customer_id,
      quote_date: quote_date || new Date(),
      lead_time,
      payment_terms,
      currency: currency || 'USD',
      shipment_type,
      margin_percent: margin_percent || 0,
      discount_percent: discount_percent || 0,
      vat_percent: vat_percent || 0,
      notes,
      status: 'Draft',
      created_by: req.user.user_id
    }, { transaction });

    // Create parts if provided
    if (parts && Array.isArray(parts)) {
      for (let i = 0; i < parts.length; i++) {
        const partData = parts[i];
        
        // Calculate operations cost
        let operationsCost = 0;
        if (partData.operations && Array.isArray(partData.operations)) {
          for (const op of partData.operations) {
            const machine = await Machine.findByPk(op.machine_id);
            if (machine) {
              operationsCost += parseFloat(machine.hourly_rate) * parseFloat(op.estimated_time_hours || 0);
            }
          }
        }

        // Calculate auxiliary cost
        let auxiliaryCost = 0;
        if (partData.auxiliaryCosts && Array.isArray(partData.auxiliaryCosts)) {
          auxiliaryCost = partData.auxiliaryCosts.reduce((sum, aux) => 
            sum + parseFloat(aux.cost_amount || 0), 0
          );
        }

        const unitTotalCost = parseFloat(partData.unit_material_cost || 0) + operationsCost + auxiliaryCost;
        const partSubtotal = unitTotalCost * parseInt(partData.quantity || 1);

        // Create part
        const part = await QuotationPart.create({
          quotation_id: quotation.quotation_id,
          part_number: partData.part_number,
          part_description: partData.part_description,
          quantity: partData.quantity || 1,
          unit_material_cost: partData.unit_material_cost || 0,
          unit_operations_cost: operationsCost.toFixed(2),
          unit_auxiliary_cost: auxiliaryCost.toFixed(2),
          unit_total_cost: unitTotalCost.toFixed(2),
          part_subtotal: partSubtotal.toFixed(2),
          sequence_order: i + 1
        }, { transaction });

        // Create operations
        if (partData.operations && Array.isArray(partData.operations)) {
          for (let j = 0; j < partData.operations.length; j++) {
            const opData = partData.operations[j];
            const machine = await Machine.findByPk(opData.machine_id);
            
            if (machine) {
              const operationCost = parseFloat(machine.hourly_rate) * parseFloat(opData.estimated_time_hours || 0);
              
              await PartOperation.create({
                part_id: part.part_id,
                machine_id: opData.machine_id,
                operation_name: opData.operation_name,
                estimated_time_hours: opData.estimated_time_hours || 0,
                machine_hourly_rate: machine.hourly_rate,
                operation_cost: operationCost.toFixed(2),
                sequence_order: j + 1
              }, { transaction });
            }
          }
        }

        // Create auxiliary costs
        if (partData.auxiliaryCosts && Array.isArray(partData.auxiliaryCosts)) {
          for (const auxData of partData.auxiliaryCosts) {
            await PartAuxiliaryCost.create({
              part_id: part.part_id,
              aux_type_id: auxData.aux_type_id,
              cost_amount: auxData.cost_amount || 0,
              description: auxData.description
            }, { transaction });
          }
        }
      }
    }

    // Recalculate quotation totals
    const allParts = await QuotationPart.findAll({
      where: { quotation_id: quotation.quotation_id },
      transaction
    });

    const totals = calculateQuotationTotals(quotation, allParts);
    await quotation.update(totals, { transaction });

    await transaction.commit();

    // Fetch complete quotation
    const completeQuotation = await Quotation.findByPk(quotation.quotation_id, {
      include: [
        { model: Customer, as: 'customer' },
        {
          model: QuotationPart,
          as: 'parts',
          include: [
            {
              model: PartOperation,
              as: 'operations',
              include: [{ model: Machine, as: 'machine' }]
            },
            {
              model: PartAuxiliaryCost,
              as: 'auxiliaryCosts',
              include: [{ model: AuxiliaryCost, as: 'auxiliaryType' }]
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: completeQuotation
    });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update quotation
// @route   PUT /api/quotations/:id
// @access  Private
exports.updateQuotation = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const quotation = await Quotation.findByPk(req.params.id, { transaction });

    if (!quotation) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    // Check permissions
    if (req.user.user_level === 'user' && quotation.created_by !== req.user.user_id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this quotation'
      });
    }

    // Can't edit approved quotations
    if (quotation.status === 'Approved' && req.user.user_level !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Cannot edit approved quotations'
      });
    }

    const {
      customer_id,
      quote_date,
      lead_time,
      payment_terms,
      currency,
      shipment_type,
      margin_percent,
      discount_percent,
      vat_percent,
      notes,
      parts
    } = req.body;

    // Update quotation header
    await quotation.update({
      customer_id: customer_id || quotation.customer_id,
      quote_date: quote_date || quotation.quote_date,
      lead_time: lead_time !== undefined ? lead_time : quotation.lead_time,
      payment_terms: payment_terms !== undefined ? payment_terms : quotation.payment_terms,
      currency: currency || quotation.currency,
      shipment_type: shipment_type !== undefined ? shipment_type : quotation.shipment_type,
      margin_percent: margin_percent !== undefined ? margin_percent : quotation.margin_percent,
      discount_percent: discount_percent !== undefined ? discount_percent : quotation.discount_percent,
      vat_percent: vat_percent !== undefined ? vat_percent : quotation.vat_percent,
      notes: notes !== undefined ? notes : quotation.notes,
      updated_by: req.user.user_id
    }, { transaction });

    // Update parts if provided
    if (parts && Array.isArray(parts)) {
      // Delete existing parts and related data
      await PartOperation.destroy({
        where: { part_id: await QuotationPart.findAll({ where: { quotation_id: quotation.quotation_id }, attributes: ['part_id'], raw: true }).then(p => p.map(x => x.part_id)) },
        transaction
      });
      await PartAuxiliaryCost.destroy({
        where: { part_id: await QuotationPart.findAll({ where: { quotation_id: quotation.quotation_id }, attributes: ['part_id'], raw: true }).then(p => p.map(x => x.part_id)) },
        transaction
      });
      await QuotationPart.destroy({ where: { quotation_id: quotation.quotation_id }, transaction });

      // Recreate parts (same logic as create)
      for (let i = 0; i < parts.length; i++) {
        const partData = parts[i];
        
        let operationsCost = 0;
        if (partData.operations && Array.isArray(partData.operations)) {
          for (const op of partData.operations) {
            const machine = await Machine.findByPk(op.machine_id);
            if (machine) {
              operationsCost += parseFloat(machine.hourly_rate) * parseFloat(op.estimated_time_hours || 0);
            }
          }
        }

        let auxiliaryCost = 0;
        if (partData.auxiliaryCosts && Array.isArray(partData.auxiliaryCosts)) {
          auxiliaryCost = partData.auxiliaryCosts.reduce((sum, aux) => 
            sum + parseFloat(aux.cost_amount || 0), 0
          );
        }

        const unitTotalCost = parseFloat(partData.unit_material_cost || 0) + operationsCost + auxiliaryCost;
        const partSubtotal = unitTotalCost * parseInt(partData.quantity || 1);

        const part = await QuotationPart.create({
          quotation_id: quotation.quotation_id,
          part_number: partData.part_number,
          part_description: partData.part_description,
          quantity: partData.quantity || 1,
          unit_material_cost: partData.unit_material_cost || 0,
          unit_operations_cost: operationsCost.toFixed(2),
          unit_auxiliary_cost: auxiliaryCost.toFixed(2),
          unit_total_cost: unitTotalCost.toFixed(2),
          part_subtotal: partSubtotal.toFixed(2),
          sequence_order: i + 1
        }, { transaction });

        if (partData.operations && Array.isArray(partData.operations)) {
          for (let j = 0; j < partData.operations.length; j++) {
            const opData = partData.operations[j];
            const machine = await Machine.findByPk(opData.machine_id);
            
            if (machine) {
              const operationCost = parseFloat(machine.hourly_rate) * parseFloat(opData.estimated_time_hours || 0);
              
              await PartOperation.create({
                part_id: part.part_id,
                machine_id: opData.machine_id,
                operation_name: opData.operation_name,
                estimated_time_hours: opData.estimated_time_hours || 0,
                machine_hourly_rate: machine.hourly_rate,
                operation_cost: operationCost.toFixed(2),
                sequence_order: j + 1
              }, { transaction });
            }
          }
        }

        if (partData.auxiliaryCosts && Array.isArray(partData.auxiliaryCosts)) {
          for (const auxData of partData.auxiliaryCosts) {
            await PartAuxiliaryCost.create({
              part_id: part.part_id,
              aux_type_id: auxData.aux_type_id,
              cost_amount: auxData.cost_amount || 0,
              description: auxData.description
            }, { transaction });
          }
        }
      }
    }

    // Recalculate totals
    const allParts = await QuotationPart.findAll({
      where: { quotation_id: quotation.quotation_id },
      transaction
    });

    const totals = calculateQuotationTotals(quotation, allParts);
    await quotation.update(totals, { transaction });

    await transaction.commit();

    // Fetch complete updated quotation
    const updatedQuotation = await Quotation.findByPk(quotation.quotation_id, {
      include: [
        { model: Customer, as: 'customer' },
        {
          model: QuotationPart,
          as: 'parts',
          include: [
            {
              model: PartOperation,
              as: 'operations',
              include: [{ model: Machine, as: 'machine' }]
            },
            {
              model: PartAuxiliaryCost,
              as: 'auxiliaryCosts',
              include: [{ model: AuxiliaryCost, as: 'auxiliaryType' }]
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedQuotation
    });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Submit quotation for approval
// @route   PUT /api/quotations/:id/submit
// @access  Private
exports.submitQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    if (quotation.created_by !== req.user.user_id && req.user.user_level === 'user') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (quotation.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft quotations can be submitted'
      });
    }

    quotation.status = 'Submitted';
    quotation.updated_by = req.user.user_id;
    await quotation.save();

    res.status(200).json({
      success: true,
      data: quotation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve/Reject quotation
// @route   PUT /api/quotations/:id/approve
// @access  Private/Admin,Approver
exports.approveQuotation = async (req, res) => {
  try {
    const { approved, rejection_reason } = req.body;
    const quotation = await Quotation.findByPk(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    if (quotation.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted quotations can be approved/rejected'
      });
    }

    quotation.status = approved ? 'Approved' : 'Rejected';
    quotation.approved_by = req.user.user_id;
    quotation.approved_at = new Date();
    if (rejection_reason) {
      quotation.notes = (quotation.notes || '') + `\nRejection reason: ${rejection_reason}`;
    }
    quotation.updated_by = req.user.user_id;
    
    await quotation.save();

    res.status(200).json({
      success: true,
      data: quotation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete quotation
// @route   DELETE /api/quotations/:id
// @access  Private/Admin
exports.deleteQuotation = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const quotation = await Quotation.findByPk(req.params.id, { transaction });

    if (!quotation) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    // Delete related data
    const parts = await QuotationPart.findAll({
      where: { quotation_id: quotation.quotation_id },
      attributes: ['part_id'],
      raw: true,
      transaction
    });
    
    const partIds = parts.map(p => p.part_id);

    if (partIds.length > 0) {
      await PartOperation.destroy({ where: { part_id: partIds }, transaction });
      await PartAuxiliaryCost.destroy({ where: { part_id: partIds }, transaction });
      await QuotationPart.destroy({ where: { quotation_id: quotation.quotation_id }, transaction });
    }

    await quotation.destroy({ transaction });
    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Quotation deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
