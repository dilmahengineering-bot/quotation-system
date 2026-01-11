const User = require('./User');
const Machine = require('./Machine');
const Customer = require('./Customer');
const AuxiliaryCost = require('./AuxiliaryCost');
const Quotation = require('./Quotation');
const QuotationPart = require('./QuotationPart');
const PartOperation = require('./PartOperation');
const PartAuxiliaryCost = require('./PartAuxiliaryCost');

// Define relationships

// User relationships
User.hasMany(Machine, { foreignKey: 'created_by', as: 'createdMachines' });
User.hasMany(Customer, { foreignKey: 'created_by', as: 'createdCustomers' });
User.hasMany(Quotation, { foreignKey: 'created_by', as: 'createdQuotations' });

// Customer relationships
Customer.hasMany(Quotation, { foreignKey: 'customer_id', as: 'quotations' });
Quotation.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// Quotation relationships
Quotation.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Quotation.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
Quotation.hasMany(QuotationPart, { foreignKey: 'quotation_id', as: 'parts' });

// QuotationPart relationships
QuotationPart.belongsTo(Quotation, { foreignKey: 'quotation_id', as: 'quotation' });
QuotationPart.hasMany(PartOperation, { foreignKey: 'part_id', as: 'operations' });
QuotationPart.hasMany(PartAuxiliaryCost, { foreignKey: 'part_id', as: 'auxiliaryCosts' });

// PartOperation relationships
PartOperation.belongsTo(QuotationPart, { foreignKey: 'part_id', as: 'part' });
PartOperation.belongsTo(Machine, { foreignKey: 'machine_id', as: 'machine' });
Machine.hasMany(PartOperation, { foreignKey: 'machine_id', as: 'operations' });

// PartAuxiliaryCost relationships
PartAuxiliaryCost.belongsTo(QuotationPart, { foreignKey: 'part_id', as: 'part' });
PartAuxiliaryCost.belongsTo(AuxiliaryCost, { foreignKey: 'aux_type_id', as: 'auxiliaryType' });
AuxiliaryCost.hasMany(PartAuxiliaryCost, { foreignKey: 'aux_type_id', as: 'partAuxiliaryCosts' });

module.exports = {
  User,
  Machine,
  Customer,
  AuxiliaryCost,
  Quotation,
  QuotationPart,
  PartOperation,
  PartAuxiliaryCost
};
